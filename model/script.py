from huggingface_hub import HfApi
import os

api = HfApi(token=os.getenv("HF_TOKEN"))
api.upload_folder(
    folder_path="clip.pth",
    repo_id="div12345/DetectiFi",
    repo_type="model",
)
