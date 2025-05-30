import os
import torch
from PIL import Image
import cv2
import numpy as np
# torchvision.transforms might still be used by CLIPProcessor or other parts,
# but if vit_transforms was its only use, it could be conditionally removed.
# For safety, keeping it unless explicitly confirmed it's not needed by CLIP parts.
# import torchvision.transforms as transforms # Removed as vit_transforms is gone
from tqdm import tqdm
import torch.nn as nn

from transformers import CLIPProcessor, CLIPModel
# from vit_new import VisionTransformer # Removed: ViT specific

# === Config ===
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
FRAME_FOLDER = "frames" # Default frame folder, can be overridden

# === Class labels ===
crime_classes = [
    "Arrest", "Arson", "Assault", "Burglary", "Explosion", "Fighting", "RoadAccidents",
    "Robbery", "Shooting", "Shoplifting", "Stealing", "Vandalism", "Abuse", "Normal"
]
# evidence_classes removed as it was ViT specific

# Enhanced crime prompts matching few-shot training
few_shot_crime_prompts = {
    "Arrest": "police officers arresting a suspect with handcuffs",
    "Arson": "building on fire from deliberate arson",
    "Assault": "person being physically attacked violently",
    "Burglary": "person breaking into private building",
    "Explosion": "explosion with debris and destruction",
    "Fighting": "multiple people fighting violently",
    "RoadAccidents": "serious car accident on roadway",
    "Robbery": "armed robbery with weapon threats",
    "Shooting": "shooting incident with firearm",
    "Shoplifting": "person stealing from retail store",
    "Stealing": "person stealing personal property",
    "Vandalism": "property being vandalized deliberately",
    "Abuse": "person being abused or harmed",
    "Normal": "normal peaceful everyday activity"
}

# === Transforms ===
# vit_transforms removed as it was ViT specific

# === Model initialization ===
class FewShotFineTunedCLIP:
    def __init__(self, model_path=None, model_name="openai/clip-vit-base-patch32"):
        self.device = device
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model = CLIPModel.from_pretrained(model_name).to(device)
        
        # Lightweight classification head (matching training)
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(self.model.config.projection_dim, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.2),
            nn.Linear(512, len(crime_classes))
        ).to(device)
        
        # Load few-shot fine-tuned weights if available
        if model_path and os.path.exists(model_path):
            print(f"🔍 Loading few-shot fine-tuned CLIP model from: {model_path}")
            try:
                checkpoint = torch.load(model_path, map_location=device)
                self.model.load_state_dict(checkpoint['model_state_dict'])
                self.classifier.load_state_dict(checkpoint['classifier_state_dict'])
                
                if 'model_config' in checkpoint:
                    config = checkpoint['model_config']
                    print(f"✅ Few-shot model loaded successfully")
                    print(f"   Training mode: {config.get('training_mode', 'unknown')}")
                    print(f"   Images per class: {config.get('images_per_class', 'unknown')}")
                    print(f"   Total training images: {config.get('total_images', 'unknown')}")
                    if 'best_acc' in checkpoint:
                         print(f"   Best accuracy: {checkpoint.get('best_acc', 'unknown'):.2f}%")
                else:
                    print("✅ Few-shot model loaded successfully (no extended metadata found in checkpoint).")
                self.use_finetuned = True
            except KeyError as e:
                print(f"❌ Error loading state dict from checkpoint: Missing key {e}. Model may not be fully loaded.")
                self.use_finetuned = False # Fallback if checkpoint is not as expected
            except Exception as e:
                print(f"❌ Error loading checkpoint {model_path}: {e}. Using zero-shot CLIP.")
                self.use_finetuned = False # Fallback
        else:
            print(f"⚠️ No few-shot fine-tuned model found at {model_path if model_path else 'N/A'}, or path does not exist. Using zero-shot CLIP.")
            self.use_finetuned = False
        
        self.model.eval()
        self.classifier.eval()

# Global models
clip_classifier = None
# vit_model removed

def load_models(clip_checkpoint="clip_finetuned_few_shot.pth"): # vit_checkpoint removed
    global clip_classifier
    
    print(f"🔍 Loading CLIP model...")
    
    # Load few-shot CLIP classifier
    clip_classifier = FewShotFineTunedCLIP(model_path=clip_checkpoint)
    
    # ViT model loading removed
    
    if clip_classifier and clip_classifier.use_finetuned:
        print("✅ CLIP model (fine-tuned) loaded and ready for analysis.")
    elif clip_classifier:
        print("✅ CLIP model (zero-shot) loaded and ready for analysis.")
    else:
        print("❌ CLIP model failed to load.")


def calculate_frame_difference(frame1, frame2, threshold=30):
    """Calculate if two frames are significantly different."""
    if frame1 is None or frame2 is None:
        return True # Treat as different if one is missing
    
    # Ensure frames are grayscale for diff
    if len(frame1.shape) == 3:
        frame1_gray = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
    else:
        frame1_gray = frame1
    
    if len(frame2.shape) == 3:
        frame2_gray = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
    else:
        frame2_gray = frame2

    diff = cv2.absdiff(frame1_gray, frame2_gray)
    mean_diff = np.mean(diff)
    return mean_diff > threshold

def extract_frames(video_path, output_folder=FRAME_FOLDER, min_frame_diff=30, max_frames=50):
    """Extract frames from video with intelligent frame selection."""
    print(f"📽 Processing video: {video_path}")
    
    video_name = os.path.splitext(os.path.basename(video_path))[0]
    # Frames will be saved in output_folder/video_name/
    frames_subfolder = os.path.join(output_folder, video_name)
    os.makedirs(frames_subfolder, exist_ok=True)
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"❌ Error: Could not open video {video_path}")
        return []
    
    total_frames_vid = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    # fps = int(cap.get(cv2.CAP_PROP_FPS)) # fps not used in current logic

    if total_frames_vid <= 0 : # Handle videos with no frames or invalid frame count
        print(f"⚠️ Video {video_path} has no frames or an invalid frame count.")
        cap.release()
        return []

    # Calculate frame sampling rate based on max_frames desired
    if max_frames > 0 and total_frames_vid > max_frames:
        frame_interval = total_frames_vid // max_frames
    else:
        frame_interval = 1 # Process all frames or up to total_frames_vid if less than max_frames
    
    if frame_interval == 0: frame_interval = 1 # Ensure interval is at least 1

    saved_frame_paths = []
    last_saved_cv2_frame = None
    frame_count_processed = 0
    
    with tqdm(total=total_frames_vid, desc=f"Extracting frames from {video_name}") as pbar:
        while cap.isOpened():
            ret, cv2_frame = cap.read()
            if not ret:
                break # End of video
                
            if frame_count_processed % frame_interval == 0:
                # Check if frame is significantly different from last saved frame
                if last_saved_cv2_frame is None or calculate_frame_difference(cv2_frame, last_saved_cv2_frame, min_frame_diff):
                    frame_filename = f"frame_{frame_count_processed:05d}.jpg"
                    frame_path = os.path.join(frames_subfolder, frame_filename)
                    cv2.imwrite(frame_path, cv2_frame)
                    saved_frame_paths.append(frame_path)
                    last_saved_cv2_frame = cv2_frame.copy() # Keep a copy of the last saved frame
                    
                    # Break if we've extracted enough frames (if max_frames is set and positive)
                    if max_frames > 0 and len(saved_frame_paths) >= max_frames:
                        break
            
            frame_count_processed += 1
            pbar.update(1)
    
    cap.release()
    print(f"✅ Extracted {len(saved_frame_paths)} frames for analysis from {video_name} into {frames_subfolder}")
    return saved_frame_paths

# get_evidence_predictions function removed as it was ViT specific

def predict_with_few_shot_finetuned(image_pil):
    """Use few-shot fine-tuned CLIP for crime classification. Expects PIL image."""
    if not clip_classifier or not clip_classifier.processor or not clip_classifier.model or not clip_classifier.classifier:
        print("❌ CLIP model or components not initialized for few-shot prediction.")
        return "Error", 0.0

    prompts = list(few_shot_crime_prompts.values())
    
    inputs = clip_classifier.processor(
        text=prompts,
        images=image_pil,
        return_tensors="pt",
        padding=True
    ).to(device)
    
    with torch.no_grad():
        outputs = clip_classifier.model(**inputs)
        image_features = outputs.image_embeds
        
        logits = clip_classifier.classifier(image_features)
        probs = torch.softmax(logits, dim=1)
    
    crime_idx = torch.argmax(probs, dim=1).item()
    predicted_crime = crime_classes[crime_idx]
    crime_conf = round(probs[0][crime_idx].item(), 3)
    
    return predicted_crime, crime_conf

def predict_with_zeroshot_clip(image_pil):
    """Fallback to zero-shot CLIP. Expects PIL image."""
    if not clip_classifier or not clip_classifier.processor or not clip_classifier.model:
        print("❌ CLIP model or components not initialized for zero-shot prediction.")
        return "Error", 0.0

    prompts = list(few_shot_crime_prompts.values())
    
    inputs = clip_classifier.processor(
        text=prompts,
        images=image_pil,
        return_tensors="pt",
        padding=True
    ).to(device)
    
    with torch.no_grad():
        outputs = clip_classifier.model(**inputs)
        # For zero-shot, logits_per_image directly gives similarity scores between image and text prompts
        probs = outputs.logits_per_image.softmax(dim=1) 
    
    crime_idx = torch.argmax(probs, dim=1).item()
    predicted_crime = crime_classes[crime_idx]
    crime_conf = round(probs[0][crime_idx].item(), 3)
    
    return predicted_crime, crime_conf

def predict_single_image(image_path):
    """Predict crime type from a single image using CLIP."""
    if not clip_classifier:
        print("❌ CLIP classifier not loaded. Cannot predict.")
        return {
            "image_name": os.path.basename(image_path),
            "error": "CLIP classifier not loaded.",
            "model_type": "unavailable"
        }
    try:
        image_pil = Image.open(image_path).convert("RGB")

        if clip_classifier.use_finetuned:
            predicted_crime, crime_conf = predict_with_few_shot_finetuned(image_pil)
            model_type = "clip-few-shot-finetuned"
        else:
            predicted_crime, crime_conf = predict_with_zeroshot_clip(image_pil)
            model_type = "clip-zero-shot"

        # ViT prediction for evidence removed

        return {
            "image_name": os.path.basename(image_path),
            "predicted_class": predicted_crime,
            "crime_confidence": crime_conf,
            # "extracted_evidence": [], # Removed
            "model_type": model_type,
            "analysis_mode": "single_image_clip_only"
        }

    except FileNotFoundError:
        print(f"❌ [ERROR] Image file not found: {image_path}")
        return {"image_name": os.path.basename(image_path), "error": f"File not found: {image_path}"}
    except Exception as e:
        print(f"❌ [ERROR] Failed on {image_path}: {e}")
        return {"image_name": os.path.basename(image_path), "error": str(e)}


def predict_multiple_images(image_paths_or_video_path):
    """
    Process multiple images or frames from a video for crime classification using CLIP.
    If a video path is provided, frames will be extracted first.
    """
    if not clip_classifier:
        print("❌ CLIP classifier not loaded. Cannot predict multiple images.")
        return {"error": "CLIP classifier not loaded."}

    image_paths_to_process = []

    # Check if input is a video path or a list of image paths
    if isinstance(image_paths_or_video_path, str) and \
       image_paths_or_video_path.lower().endswith((".mp4", ".mov", ".avi", ".mkv")):
        print(f"📽 Input is a video. Extracting frames from: {image_paths_or_video_path}")
        # Note: extract_frames now saves into FRAME_FOLDER/video_name/
        # It's up to the caller (FastAPI app) to manage this FRAME_FOLDER if needed.
        image_paths_to_process = extract_frames(image_paths_or_video_path, output_folder=FRAME_FOLDER)
    elif isinstance(image_paths_or_video_path, list):
        image_paths_to_process = image_paths_or_video_path
    else:
        print(f"⚠️ Invalid input to predict_multiple_images: {type(image_paths_or_video_path)}. Expected video path string or list of image paths.")
        return {"error": "Invalid input type. Expected video path or list of image paths."}

    if not image_paths_to_process:
        return {"error": "No valid frames or images found for CLIP analysis."}

    print(f"🎯 Analyzing {len(image_paths_to_process)} images with CLIP model...")

    individual_results = []
    crime_votes = {} # Stores sum of confidences for each crime type
    model_type_reported = None # To report which CLIP model type was used

    for img_path in tqdm(image_paths_to_process, desc="CLIP Processing images"):
        result = predict_single_image(img_path) # This now only returns CLIP results
        if not result or "error" in result:
            print(f"⚠️ Skipping {img_path} due to error: {result.get('error', 'Unknown error') if result else 'None'}")
            continue
            
        individual_results.append(result)
        crime = result["predicted_class"]
        confidence = result["crime_confidence"]
        model_type_reported = result["model_type"] # Capture from first valid result
        
        crime_votes[crime] = crime_votes.get(crime, 0) + confidence # Weighted vote by confidence

    if not crime_votes:
        return {"error": "No valid CLIP predictions obtained from images."}

    # Aggregate results for crime classification
    final_crime = max(crime_votes, key=crime_votes.get)
    total_confidence_sum = sum(crime_votes.values())
    
    # Calculate overall confidence for the final_crime based on its proportion of total weighted votes
    # This is one way to define aggregated confidence.
    final_crime_confidence = 0
    if total_confidence_sum > 0:
         final_crime_confidence = round(crime_votes[final_crime] / total_confidence_sum, 3)
    else: # Avoid division by zero if all confidences were 0 (unlikely with softmax)
        final_crime_confidence = 0.0


    # Calculate confidence distribution for all detected crime types
    crime_distribution = {
        crime: round(votes / total_confidence_sum, 3) if total_confidence_sum > 0 else 0.0
        for crime, votes in crime_votes.items()
    }
    
    # Evidence aggregation removed

    return {
        "predicted_crime_class_aggregated": final_crime,
        "crime_confidence_aggregated": final_crime_confidence,
        "crime_class_distribution": crime_distribution,
        # "extracted_evidence_aggregated": [], # Removed
        "images_analyzed_by_clip": len(individual_results),
        "total_input_image_paths": len(image_paths_to_process),
        "clip_model_type_used": model_type_reported,
        "analysis_mode": "multiple_images_clip_only_aggregated"
    }

def process_crime_scene(image_paths):
    """Process multiple images from a crime scene using only CLIP for classification."""
    try:
        results = predict_multiple_images(image_paths) # Now only uses CLIP
        
        if "error" in results:
            return {
                "status": "error",
                "message": results["error"]
            }
            
        return {
            "status": "success",
            "clip_crime_analysis": results # Renamed for clarity
        }
        
    except Exception as e:
        print(f"❌ Exception in process_crime_scene: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

# Aliases for potential backwards compatibility if old names were used by other scripts.
# However, it's better to update calling scripts to use the new, more descriptive names.
predict = predict_single_image
predict_multiple = predict_multiple_images
