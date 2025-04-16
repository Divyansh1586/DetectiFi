import torch
import clip
from torchvision.datasets import ImageFolder
from torchvision import transforms
from torch.utils.data import DataLoader
import os

# ✅ Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"[CHECKPOINT] 🚀 Using device: {device}")

# ✅ Define Dataset Paths
test_data_path = r"C:/Users/rishi/OneDrive/Desktop/data/test"

# ✅ Verify if path exists
if not os.path.exists(test_data_path):
    raise FileNotFoundError(f"Test dataset folder not found! Check path: {test_data_path}")

# ✅ Load CLIP model and processor
model, preprocess = clip.load("ViT-B/32", device=device)

# ✅ Load test dataset
test_dataset = ImageFolder(root=test_data_path, transform=preprocess)
test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

# ✅ Load trained classifier
num_classes = len(test_dataset.classes)
classifier = torch.nn.Linear(512, num_classes).to(device)
classifier.load_state_dict(torch.load("clip_classifier_epoch1.pth"))
classifier.eval()

# ✅ Function to Test the Model
def test_clip_classifier(model, classifier, test_loader):
    model.eval()
    classifier.eval()

    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            
            # ✅ Extract image features using CLIP
            image_features = model.encode_image(images)



























     
            
            # ✅ Predict class labels
            outputs = classifier(image_features)
            _, predicted = torch.max(outputs, 1)

            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    accuracy = 100 * correct / total
    print(f"[CHECKPOINT] 🎯 Test Accuracy: {accuracy:.2f}%")
    return accuracy

# ✅ Run Testing
if __name__ == "__main__":
    print("[CHECKPOINT] ✅ Testing the Model...")
    accuracy = test_clip_classifier(model, classifier, test_loader)
    print(f"[CHECKPOINT] 🎯 Final Test Accuracy: {accuracy:.2f}%")
    print("[CHECKPOINT] 🎉 Testing Finished!")