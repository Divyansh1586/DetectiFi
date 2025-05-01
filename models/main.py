from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torch.nn as nn
import clip
import io
import json

# Load label mapping
with open("labels.json", "r") as f:
    index_to_label = json.load(f)

# Load CLIP model and preprocessing
device = "cpu"
clip_model, preprocess = clip.load("ViT-B/32", device=device)
clip_model.float()

# Define CLIPClassifier
class CLIPClassifier(nn.Module):
    def __init__(self, clip_model, num_classes):
        super(CLIPClassifier, self).__init__()
        self.clip_model = clip_model
        for param in self.clip_model.parameters():
            param.requires_grad = False
        self.fc = nn.Linear(512, num_classes)

    def forward(self, image):
        image = image.to(torch.float32)
        with torch.no_grad():
            features = self.clip_model.encode_image(image).to(torch.float32)
        return self.fc(features)

# Initialize and load trained weights
num_classes = len(index_to_label)
model = CLIPClassifier(clip_model, num_classes)
state_dict = torch.load("best_crime_clip_model.pth", map_location=device)
model.load_state_dict(state_dict)
model.eval()

# FastAPI app
app = FastAPI()

# ✅ Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_tensor = preprocess(image).unsqueeze(0)

        with torch.no_grad():
            outputs = model(image_tensor)
            _, predicted = torch.max(outputs, 1)
            label = index_to_label[str(predicted.item())]

        return {"prediction": label}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
