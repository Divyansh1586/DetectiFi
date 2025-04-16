import torch
import clip
from torchvision.datasets import ImageFolder
from torchvision import transforms
from torch.utils.data import DataLoader
import os
import time

# ✅ Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"[CHECKPOINT] 🚀 Using device: {device}")

# ✅ Define Dataset Paths
train_data_path = r"C:/Users/rishi/OneDrive/Desktop/data/train"
test_data_path = r"C:/Users/rishi/OneDrive/Desktop/data/test"

# ✅ Verify if paths exist
if not os.path.exists(train_data_path) or not os.path.exists(test_data_path):
    raise FileNotFoundError(f"Dataset folders not found! Check paths:\n{train_data_path}\n{test_data_path}")

# ✅ Load CLIP model and processor
model, preprocess = clip.load("ViT-B/32", device=device)

# ✅ Load dataset with CLIP preprocessing
train_dataset = ImageFolder(root=train_data_path, transform=preprocess)
test_dataset = ImageFolder(root=test_data_path, transform=preprocess)

# ✅ Data Loaders
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

# ✅ Auto-detect number of classes
num_classes = len(train_dataset.classes)
print(f"[CHECKPOINT] 🔢 Number of classes detected: {num_classes}")

# ✅ Convert class names into CLIP text embeddings
class_names = train_dataset.classes
text_inputs = clip.tokenize([f"A photo of {cls}" for cls in class_names]).to(device)
text_features = model.encode_text(text_inputs).detach()

# ✅ Training Function
def train_clip_classifier(model, train_loader, text_features, epochs=1):
    model.eval()  # CLIP backbone remains frozen
    classifier = torch.nn.Linear(512, num_classes).to(device)  # Trainable classifier
    optimizer = torch.optim.Adam(classifier.parameters(), lr=0.001)
    loss_fn = torch.nn.CrossEntropyLoss()

    print("\n[CHECKPOINT] ✅ Training Started...\n")

    for epoch in range(epochs):
        print(f"\n[CHECKPOINT] 🚀 Epoch {epoch+1}/{epochs} Started...\n")
        start_time = time.time()
        total_loss = 0

        for batch_idx, (images, labels) in enumerate(train_loader):
            images, labels = images.to(device), labels.to(device)
            
            # ✅ Extract image features using CLIP
            with torch.no_grad():
                image_features = model.encode_image(images)

            # ✅ Train classifier on extracted embeddings
            outputs = classifier(image_features)
            loss = loss_fn(outputs, labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

            # ✅ Print every 10 batches for tracking
            if batch_idx % 10 == 0:
                avg_loss = total_loss / (batch_idx + 1)
                print(f"[CHECKPOINT] ✅ Epoch {epoch+1}, Batch {batch_idx}/{len(train_loader)}, Loss: {loss.item():.4f}, Avg Loss: {avg_loss:.4f}")

        end_time = time.time()
        print(f"[CHECKPOINT] 🕒 Epoch {epoch+1} Completed in {end_time - start_time:.2f} sec, Final Avg Loss: {total_loss/len(train_loader):.4f}\n")

        # ✅ Save model checkpoint after epoch
        checkpoint_path = f"clip_classifier_epoch{epoch+1}.pth"
        torch.save(classifier.state_dict(), checkpoint_path)
        print(f"[CHECKPOINT] 💾 Classifier saved: {checkpoint_path}\n")

    print("[CHECKPOINT] 🎉 Training Complete!\n")
    return classifier

# ✅ Run Training
if __name__ == "__main__":
    print("[CHECKPOINT] ✅ Model Initialized and Ready to Train.")
    classifier = train_clip_classifier(model, train_loader, text_features, epochs=1)
    print("[CHECKPOINT] 🎉 Training Finished!")
