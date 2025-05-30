import os
import cv2
import numpy as np
import asyncio
import shutil
from typing import List, Optional
from PIL import Image as PILImage # Alias to avoid conflict with FastAPI's Image

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from ultralytics import YOLO
from fastapi.staticfiles import StaticFiles # Import StaticFiles for serving HTML

# Assuming clip_pipeline.py is in the same directory
import clip_pipeline # type: ignore

# --- Configuration ---
YOLO_MODEL_PATH = "best.pt"  # Your YOLOv8 model
CLIP_MODEL_PATH = "clip.pth" # Your fine-tuned CLIP model
FRAME_FOLDER = "frames" # Folder to store extracted frames for video processing & temp webcam frames

# --- Model Loading ---
yolo_model = None
try:
    if os.path.exists(YOLO_MODEL_PATH):
        yolo_model = YOLO(YOLO_MODEL_PATH)
        print("Successfully loaded YOLOv8 model.")
    else:
        print(f"Error: YOLOv8 model file not found at {YOLO_MODEL_PATH}")
except Exception as e:
    print(f"Error loading YOLOv8 model: {e}")

try:
    print(f"Loading CLIP model from: {CLIP_MODEL_PATH}")
    if not os.path.exists(CLIP_MODEL_PATH):
        print(f"Error: CLIP model file not found at {CLIP_MODEL_PATH}. CLIP features will be unavailable.")
        clip_pipeline.clip_classifier = None
    else:
        clip_pipeline.load_models(clip_checkpoint=CLIP_MODEL_PATH)
        if clip_pipeline.clip_classifier:
            print("Successfully loaded CLIP model.")
        else:
            print("CLIP model might not have loaded correctly.")
except ImportError as e:
    print(f"ImportError during CLIP model loading: {e}.")
    if hasattr(clip_pipeline, 'clip_classifier'):
        clip_pipeline.clip_classifier = None
except Exception as e:
    print(f"Error loading CLIP model: {e}.")
    if hasattr(clip_pipeline, 'clip_classifier'):
        clip_pipeline.clip_classifier = None


app = FastAPI(title="Crime Detection API with YOLO, (CLIP removed from Webcam), and Webcam Streaming")

# Mount a static directory to serve your HTML file
# This assumes your index.html is in a folder named 'static'
#app.mount("/static", StaticFiles(directory="static"), name="static")

os.makedirs(FRAME_FOLDER, exist_ok=True)
# Create a subfolder for temporary webcam frames to keep things organized
WEBCAM_TEMP_FRAME_FOLDER = os.path.join(FRAME_FOLDER, "webcam_temp")
os.makedirs(WEBCAM_TEMP_FRAME_FOLDER, exist_ok=True)


# --- Webcam Global State ---
webcam_active_flag = False
webcam_lock = asyncio.Lock()


# --- Helper Functions ---

def yolo_detect_objects(frame_cv2):
    detections = []
    if not yolo_model:
        return detections
    results = yolo_model(frame_cv2, verbose=False)
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls)
            class_name = yolo_model.names[class_id]
            confidence = float(box.conf)
            bbox = [int(coord) for coord in box.xyxy[0].tolist()]
            detections.append({
                "class": class_name,
                "confidence": round(confidence, 3),
                "box_xyxy": bbox
            })
    return detections

async def process_single_image_analysis(file_content: bytes, filename: str):
    try:
        image_np = np.frombuffer(file_content, np.uint8)
        frame_cv2 = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        if frame_cv2 is None:
            raise ValueError("Could not decode image.")
    except Exception as e:
        return {
            "filename": filename, "error": f"Invalid image file: {str(e)}",
            "yolo_detections": [], "clip_crime_classification": None
        }

    yolo_results = yolo_detect_objects(frame_cv2.copy()) if yolo_model else []
    if not yolo_model: print("YOLO model not loaded. Skipping YOLO for single image.")

    clip_crime_results = None
    if clip_pipeline.clip_classifier:
        temp_image_path = os.path.join(WEBCAM_TEMP_FRAME_FOLDER, f"temp_single_{filename}")
        try:
            cv2.imwrite(temp_image_path, frame_cv2)
            clip_crime_results = clip_pipeline.predict_single_image(temp_image_path)
        except Exception as e:
            print(f"Error during CLIP processing for {filename}: {e}")
            clip_crime_results = {"error": str(e)}
        finally:
            if os.path.exists(temp_image_path):
                os.remove(temp_image_path)
    else:
        print("CLIP model not loaded. Skipping CLIP for single image.")
        clip_crime_results = {"error": "CLIP model not loaded."}

    return {
        "filename": filename, "yolo_detections": yolo_results,
        "clip_crime_classification": clip_crime_results, "error": None
    }

# --- Webcam Streaming Logic (Simplified to YOLO-only) ---
async def generate_webcam_frames_with_detection():
    global webcam_active_flag
    cap = None

    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            error_msg = "Error: Could not open webcam."
            print(error_msg)
            yield (b'--frame\r\nContent-Type: text/plain\r\n\r\n' + error_msg.encode() + b'\r\n')
            return

        print("Webcam stream started with YOLO object detection ONLY.")
        async with webcam_lock:
             webcam_active_flag = True

        while True:
            async with webcam_lock:
                if not webcam_active_flag:
                    print("Webcam flag turned off, stopping stream generation.")
                    break

            ret, frame_cv2 = cap.read()
            if not ret:
                print("Error: Failed to grab frame from webcam. Stopping.")
                break

            annotated_frame = frame_cv2.copy()
            
            # 1. YOLO Object Detection (Always On)
            if yolo_model:
                yolo_detections = yolo_detect_objects(frame_cv2)
                for det in yolo_detections:
                    x1, y1, x2, y2 = det['box_xyxy']
                    label = f"{det['class']} ({det['confidence']:.2f})"
                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(annotated_frame, label, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            else:
                cv2.putText(annotated_frame, "YOLO Model Not Loaded", (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

            # Encode frame as JPEG for streaming
            ret_jpeg, buffer = cv2.imencode('.jpg', annotated_frame)
            if not ret_jpeg:
                print("Error: Failed to encode frame to JPEG.")
                continue
            
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            await asyncio.sleep(0.03) # Adjust sleep for desired frame rate vs server load (e.g. 0.03 for ~30fps target)

    except asyncio.CancelledError:
        print("Webcam stream task was cancelled.")
    except Exception as e:
        print(f"An unexpected error occurred during webcam streaming: {e}")
        error_msg_stream = f"Stream Error: {str(e)[:100]}"
        try:
            yield (b'--frame\r\nContent-Type: text/plain\r\n\r\n' + error_msg_stream.encode() + b'\r\n')
        except Exception as e_yield:
            print(f"Could not yield error to stream: {e_yield}")
    finally:
        if cap and cap.isOpened():
            cap.release()
        async with webcam_lock:
            webcam_active_flag = False
            print("Webcam resources released and stream stopped.")


# --- API Endpoints (Image and Video processing endpoints remain unchanged, using CLIP) ---

@app.post("/process-images/", summary="Process multiple uploaded images (YOLO objects, CLIP crime type)")
async def process_multiple_images_endpoint(files: List[UploadFile] = File(...)):
    if not yolo_model and not (hasattr(clip_pipeline, 'clip_classifier') and clip_pipeline.clip_classifier):
        raise HTTPException(status_code=503, detail="Models not loaded.")
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")
    results = []
    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            results.append({
                "filename": file.filename, "error": "Invalid file type.",
                "yolo_detections": [], "clip_crime_classification": None
            })
            continue
        contents = await file.read()
        results.append(await process_single_image_analysis(contents, file.filename))
        await file.close()
    return results

@app.post("/process-video/", summary="Process an uploaded video (YOLO objects, CLIP crime type)")
async def process_video_endpoint(file: UploadFile = File(...)):
    if not yolo_model and not (hasattr(clip_pipeline, 'clip_classifier') and clip_pipeline.clip_classifier):
        raise HTTPException(status_code=503, detail="Models not loaded.")
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type.")

    temp_video_dir = os.path.join(FRAME_FOLDER, "temp_videos")
    os.makedirs(temp_video_dir, exist_ok=True)
    temp_video_path = os.path.join(temp_video_dir, f"temp_{file.filename}")

    try:
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save temp video: {str(e)}")
    finally:
        await file.close()

    extracted_frame_paths = []
    clip_crime_summary = None
    yolo_detections_on_extracted_frames = []
    video_base_name = os.path.splitext(file.filename)[0]
    video_specific_frame_folder = os.path.join(FRAME_FOLDER, video_base_name)

    if clip_pipeline.clip_classifier:
        try:
            if os.path.exists(video_specific_frame_folder): shutil.rmtree(video_specific_frame_folder)
            os.makedirs(video_specific_frame_folder, exist_ok=True)
            extracted_frame_paths = clip_pipeline.extract_frames(video_path=temp_video_path, output_folder=video_specific_frame_folder)
            
            if not extracted_frame_paths:
                clip_crime_summary = {"error": "No frames extracted for CLIP."}
            else:
                clip_crime_summary = clip_pipeline.predict_multiple_images(extracted_frame_paths)
                if yolo_model:
                    for frame_path in extracted_frame_paths:
                        try:
                            frame_img = cv2.imread(frame_path)
                            if frame_img is not None:
                                yolo_detections_on_extracted_frames.append({
                                    "frame_path": os.path.relpath(frame_path, FRAME_FOLDER),
                                    "yolo_objects": yolo_detect_objects(frame_img)
                                })
                        except Exception as e_yolo_vid:
                             yolo_detections_on_extracted_frames.append({
                                "frame_path": os.path.relpath(frame_path, FRAME_FOLDER), "error": str(e_yolo_vid)
                            })
        except Exception as e:
            clip_crime_summary = {"error": f"CLIP video processing error: {str(e)}"}

    if os.path.exists(temp_video_path): os.remove(temp_video_path)
    if os.path.exists(temp_video_dir) and not os.listdir(temp_video_dir): os.rmdir(temp_video_dir)

    return {
        "filename": file.filename,
        "clip_crime_classification_summary": clip_crime_summary,
        "yolo_detections_on_extracted_frames": yolo_detections_on_extracted_frames,
    }


@app.get("/start-webcam/", summary="Start live webcam feed with YOLO and CLIP analysis")
async def start_webcam_streaming_endpoint():
    global webcam_active_flag
    if not yolo_model:
        raise HTTPException(status_code=503, detail="YOLO model not loaded. Cannot start webcam.")

    async with webcam_lock:
        if webcam_active_flag:
            raise HTTPException(status_code=409, detail="Webcam is already active.")
        
        cap_test = cv2.VideoCapture(0)
        if not cap_test.isOpened():
            cap_test.release()
            raise HTTPException(status_code=500, detail="Could not open webcam. Ensure it's connected and not in use.")
        cap_test.release()
        
        webcam_active_flag = True

    return StreamingResponse(generate_webcam_frames_with_detection(), media_type='multipart/x-mixed-replace; boundary=frame')

@app.get("/stop-webcam/", summary="Stop the live webcam feed")
async def stop_webcam_streaming_endpoint():
    global webcam_active_flag
    stopped_message = "Webcam stop signal sent. The stream will terminate gracefully."
    already_stopped_message = "Webcam is not currently active."
    
    async with webcam_lock:
        if not webcam_active_flag:
            return {"message": already_stopped_message}
        
        print("Sending stop signal to webcam stream...")
        webcam_active_flag = False

    return {"message": stopped_message}


if __name__ == "__main__":
    import uvicorn
    print("Starting Uvicorn server for crime detection API (Webcam: YOLO only)...")
    os.makedirs(FRAME_FOLDER, exist_ok=True)
    os.makedirs(WEBCAM_TEMP_FRAME_FOLDER, exist_ok=True)
    uvicorn.run(app, host="0.0.0.0", port=8000)