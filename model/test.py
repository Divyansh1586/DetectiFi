import cv2

def list_cameras():
    print("Checking camera indices...")
    found_cameras = {}
    for i in range(10):  # Check up to 10 potential camera indices
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                print(f"Found camera at index {i}. Frame captured successfully.")
                found_cameras[i] = "Working"
                cap.release()
                # Try to get camera properties for more info if available
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                print(f"  Resolution: {width}x{height}")
            else:
                print(f"Found camera at index {i}, but could not read frame.")
                found_cameras[i] = "No Frame"
                cap.release()
        else:
            print(f"No camera found at index {i}.")
    
    if not found_cameras:
        print("\nNo cameras detected at all. Ensure your webcam is connected and drivers are installed.")
    else:
        print("\n--- Summary of Found Cameras ---")
        for idx, status in found_cameras.items():
            print(f"Index {idx}: {status}")
        print("\nLook for the index that corresponds to your Mac's built-in camera.")

if __name__ == "__main__":
    list_cameras()