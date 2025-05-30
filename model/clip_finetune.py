import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, random_split
from torchvision import transforms
from transformers import CLIPModel, CLIPProcessor
from PIL import Image
from tqdm import tqdm
import json
import random
import shutil

class FewShotCrimeDataset(Dataset):
    def __init__(self, image_folder, processor, crime_classes, images_per_class=300, split='train', use_augmentation=True):
        self.image_folder = image_folder
        self.processor = processor
        self.crime_classes = crime_classes
        self.images_per_class = images_per_class
        self.use_augmentation = use_augmentation
        
        
        self.image_paths = []
        self.labels = []
        
        print(f"🎯 Sampling {images_per_class} images per class for few-shot learning...")
        
        for class_idx, class_name in enumerate(crime_classes):
            class_dir = os.path.join(image_folder, class_name)
            if not os.path.exists(class_dir):
                print(f"⚠️ Class directory not found: {class_name}")
                continue
                
            
            all_images = [f for f in os.listdir(class_dir) 
                         if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp'))]
            
            
            sampled_count = min(len(all_images), images_per_class)
            sampled_images = random.sample(all_images, sampled_count)
            
            print(f"  📸 {class_name:15}: {sampled_count:3d}/{len(all_images):5d} images sampled")
            
            for img_file in sampled_images:
                self.image_paths.append(os.path.join(class_dir, img_file))
                self.labels.append(class_idx)
        
        print(f"✅ Total few-shot dataset: {len(self.image_paths)} images")
        
        
        self.augmentation = transforms.Compose([
            transforms.RandomResizedCrop(224, scale=(0.7, 1.0)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.15),
            transforms.RandomRotation(degrees=20),
            transforms.RandomPerspective(distortion_scale=0.25, p=0.4),
            transforms.GaussianBlur(kernel_size=5, sigma=(0.1, 2.5)),
            transforms.RandomAdjustSharpness(sharpness_factor=2, p=0.3),
            transforms.RandomAutocontrast(p=0.3),
        ]) if use_augmentation else None
        
        
        self.text_prompts = self.create_few_shot_prompts()
    
    def create_few_shot_prompts(self):
        few_shot_prompts = {
            "Arrest": [
                "police officers arresting a suspect with handcuffs",
                "law enforcement making an arrest",
                "person being detained by police",
                "arrest scene with officers and suspect",
                "police custody and arrest procedure"
            ],
            "Arson": [
                "building on fire from deliberate arson",
                "structure burning from arson attack",
                "flames and smoke from intentional fire",
                "arson fire with extensive damage",
                "property destroyed by arsonist"
            ],
            "Assault": [
                "person being physically attacked violently",
                "violent assault with bodily harm",
                "physical confrontation causing injury",
                "aggressive attack on victim",
                "violent assault in progress"
            ],
            "Burglary": [
                "person breaking into private building",
                "forced entry and burglary scene",
                "burglar inside residential property",
                "breaking and entering crime",
                "burglary with property theft"
            ],
            "Explosion": [
                "explosion with debris and destruction",
                "blast causing significant damage",
                "detonation with fire and smoke",
                "explosive incident scene",
                "explosion aftermath with rubble"
            ],
            "Fighting": [
                "multiple people fighting violently",
                "physical brawl between individuals",
                "group fight with aggressive behavior",
                "violent confrontation between people",
                "fighting scene with multiple participants"
            ],
            "RoadAccidents": [
                "serious car accident on roadway",
                "vehicle collision with damage",
                "traffic accident with emergency response",
                "automobile crash scene",
                "road accident with injured victims"
            ],
            "Robbery": [
                "armed robbery with weapon threats",
                "criminal robbing victim at gunpoint",
                "masked robber stealing with force",
                "robbery scene with weapon",
                "violent theft with intimidation"
            ],
            "Shooting": [
                "shooting incident with firearm",
                "gun violence scene",
                "person firing weapon",
                "shooting with visible gun",
                "firearm discharge incident"
            ],
            "Shoplifting": [
                "person stealing from retail store",
                "shoplifting in progress at shop",
                "theft of merchandise from store",
                "customer stealing without payment",
                "retail theft scene"
            ],
            "Stealing": [
                "person stealing personal property",
                "theft of valuable belongings",
                "criminal taking items without permission",
                "larceny and property theft",
                "stealing scene with perpetrator"
            ],
            "Vandalism": [
                "property being vandalized deliberately",
                "graffiti and property destruction",
                "criminal damage to building",
                "vandalism with property defacement",
                "destruction of public property"
            ],
            "Abuse": [
                "person being abused or harmed",
                "violence against vulnerable individual",
                "abusive treatment causing harm",
                "victim of abuse incident",
                "harmful abuse scene"
            ],
            "Normal": [
                "normal peaceful everyday activity",
                "regular non-criminal daily life",
                "ordinary people in safe environment",
                "harmless routine activities",
                "peaceful normal behavior"
            ]
        }
        
        return few_shot_prompts
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        image_path = self.image_paths[idx]
        label = self.labels[idx]
        class_name = self.crime_classes[label]
        
        
        try:
            image = Image.open(image_path).convert('RGB')
            
            
            if self.use_augmentation and self.augmentation:
                image = self.augmentation(image)
                
        except Exception as e:
            print(f"Error loading image {image_path}: {e}")
            image = Image.new('RGB', (224, 224), (0, 0, 0))
        
        
        available_prompts = self.text_prompts.get(class_name, [f"a photo of {class_name.lower()}"])
        text_prompt = random.choice(available_prompts)
        
        return image, text_prompt, label

class FewShotCLIPFineTuner:
    
    def __init__(self, model_name="openai/clip-vit-base-patch32", num_classes=14):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"🔥 Using device: {self.device}")
        
        
        self.model = CLIPModel.from_pretrained(model_name).to(self.device)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        
        
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(self.model.config.projection_dim, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.2),
            nn.Linear(512, num_classes)
        ).to(self.device)
        
        
        self.freeze_early_layers(freeze_ratio=0.7)
        
    def freeze_early_layers(self, freeze_ratio=0.7):
        
        vision_layers = list(self.model.vision_model.encoder.layers)
        freeze_count = int(len(vision_layers) * freeze_ratio)
        
        for i in range(freeze_count):
            for param in vision_layers[i].parameters():
                param.requires_grad = False
        
        
        text_layers = list(self.model.text_model.encoder.layers)
        text_freeze_count = int(len(text_layers) * 0.8)
        
        for i in range(text_freeze_count):
            for param in text_layers[i].parameters():
                param.requires_grad = False
        
        print(f"🧊 Frozen {freeze_count}/{len(vision_layers)} vision layers")
        print(f"🧊 Frozen {text_freeze_count}/{len(text_layers)} text layers")
        print(f"🎯 Training {len(vision_layers)-freeze_count} vision + {len(text_layers)-text_freeze_count} text layers + classifier")
    
    def custom_collate_fn(self, batch):
        
        images, texts, labels = zip(*batch)
        
        inputs = self.processor(
            text=list(texts), 
            images=list(images), 
            return_tensors="pt", 
            padding=True,
            truncation=True
        )
        
        for key in inputs:
            inputs[key] = inputs[key].to(self.device)
        
        labels = torch.tensor(labels, dtype=torch.long).to(self.device)
        
        return inputs, labels
    
    def train_epoch(self, dataloader, optimizer, criterion, epoch, scheduler=None):
        
        self.model.train()
        self.classifier.train()
        
        total_loss = 0
        total_correct = 0
        total_samples = 0
        
        loop = tqdm(dataloader, desc=f"Few-Shot Training Epoch {epoch+1}")
        
        for batch_idx, (inputs, labels) in enumerate(loop):
            optimizer.zero_grad()
            
            outputs = self.model(**inputs)
            image_features = outputs.image_embeds
            logits = self.classifier(image_features)
            
            loss = criterion(logits, labels)
            loss.backward()
            
            
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            torch.nn.utils.clip_grad_norm_(self.classifier.parameters(), max_norm=1.0)
            
            optimizer.step()
            
            if scheduler:
                scheduler.step()
            
            total_loss += loss.item()
            _, preds = logits.max(1)
            total_correct += (preds == labels).sum().item()
            total_samples += labels.size(0)
            
            accuracy = 100.0 * total_correct / total_samples
            current_lr = optimizer.param_groups[0]['lr']
            loop.set_postfix(loss=loss.item(), acc=f"{accuracy:.2f}%", lr=f"{current_lr:.2e}")
        
        avg_loss = total_loss / len(dataloader)
        avg_acc = 100.0 * total_correct / total_samples
        
        return avg_loss, avg_acc
    
    def validate(self, dataloader, criterion):
        
        self.model.eval()
        self.classifier.eval()
        
        total_loss = 0
        total_correct = 0
        total_samples = 0
        class_correct = torch.zeros(14)
        class_total = torch.zeros(14)
        confidence_scores = []
        
        with torch.no_grad():
            for inputs, labels in tqdm(dataloader, desc="Validating", leave=False):
                outputs = self.model(**inputs)
                image_features = outputs.image_embeds
                logits = self.classifier(image_features)
                
                loss = criterion(logits, labels)
                total_loss += loss.item()
                
                
                probs = torch.softmax(logits, dim=1)
                max_probs, preds = torch.max(probs, dim=1)
                confidence_scores.extend(max_probs.cpu().tolist())
                
                total_correct += (preds == labels).sum().item()
                total_samples += labels.size(0)
                
                
                for i in range(labels.size(0)):
                    label = labels[i]
                    class_correct[label] += (preds[i] == label).item()
                    class_total[label] += 1
        
        avg_loss = total_loss / len(dataloader)
        avg_acc = 100.0 * total_correct / total_samples
        avg_confidence = sum(confidence_scores) / len(confidence_scores)
        
        
        crime_classes = [
            "Arrest", "Arson", "Assault", "Burglary", "Explosion", "Fighting", 
            "RoadAccidents", "Robbery", "Shooting", "Shoplifting", "Stealing", 
            "Vandalism", "Abuse", "Normal"
        ]
        
        class_accuracies = {}
        for i, class_name in enumerate(crime_classes):
            if class_total[i] > 0:
                class_acc = 100.0 * class_correct[i] / class_total[i]
                class_accuracies[class_name] = class_acc
        
        return avg_loss, avg_acc, class_accuracies, avg_confidence
    
    def save_model(self, path, epoch, best_acc, class_accuracies=None, avg_confidence=None, training_info=None):
        """Save model with few-shot metadata"""
        checkpoint = {
            'epoch': epoch,
            'model_state_dict': self.model.state_dict(),
            'classifier_state_dict': self.classifier.state_dict(),
            'best_acc': best_acc,
            'avg_confidence': avg_confidence,
            'class_accuracies': class_accuracies or {},
            'training_info': training_info or {},
            'model_config': {
                'freeze_ratio': 0.7,
                'training_mode': 'few_shot',
                'images_per_class': training_info.get('images_per_class', 'unknown'),
                'total_images': training_info.get('total_images', 'unknown'),
                'model_type': 'few_shot_clip'
            }
        }
        torch.save(checkpoint, path)
        print(f"💾 Few-shot model saved to {path}")

def create_balanced_subset(base_dir, output_dir, images_per_class=300):
    
    crime_classes = [
        "Arrest", "Arson", "Assault", "Burglary", "Explosion", "Fighting", 
        "RoadAccidents", "Robbery", "Shooting", "Shoplifting", "Stealing", 
        "Vandalism", "Abuse", "Normal"
    ]
    
    print(f"📁 Creating balanced subset: {images_per_class} images per class")
    print(f"📂 Source: {base_dir}")
    print(f"📂 Output: {output_dir}")
    
    os.makedirs(output_dir, exist_ok=True)
    total_copied = 0
    
    for class_name in crime_classes:
        source_class_dir = os.path.join(base_dir, class_name)
        target_class_dir = os.path.join(output_dir, class_name)
        
        if not os.path.exists(source_class_dir):
            print(f"⚠️ Skipping {class_name} - source directory not found")
            continue
            
        os.makedirs(target_class_dir, exist_ok=True)
        

        all_images = [f for f in os.listdir(source_class_dir) 
                     if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp'))]
        

        sample_count = min(len(all_images), images_per_class)
        sampled_images = random.sample(all_images, sample_count)
        
        
        for img_file in sampled_images:
            source_path = os.path.join(source_class_dir, img_file)
            target_path = os.path.join(target_class_dir, img_file)
            shutil.copy2(source_path, target_path)
        
        total_copied += sample_count
        print(f"  ✅ {class_name:15}: {sample_count:3d}/{len(all_images):5d} images copied")
    
    print(f"🎯 Balanced subset created: {total_copied} total images")
    return output_dir

def main():
    
    CONFIG = {
        'train_dir': r"C:/Users/adity/Downloads/ucf_dataset/Train",
        'images_per_class': 300,  
        'batch_size': 32,
        'learning_rate': 1e-5,  
        'epochs': 8,  
        'num_classes': 14,
        'save_path': 'clip_finetuned_few_shot.pth',
        'weight_decay': 0.01,
        'create_subset': False 
    }
    
    crime_classes = [
        "Arrest", "Arson", "Assault", "Burglary", "Explosion", "Fighting", 
        "RoadAccidents", "Robbery", "Shooting", "Shoplifting", "Stealing", 
        "Vandalism", "Abuse", "Normal"
    ]
    
    print("🎯 FEW-SHOT CLIP FINE-TUNING")
    print("="*60)
    print(f"📸 Using only {CONFIG['images_per_class']} images per class")
    print(f"🚀 Total training images: ~{CONFIG['images_per_class'] * len(crime_classes):,}")
    print(f"⚡ Much faster than full dataset training!")
    print(f"📊 Configuration: {CONFIG}")
    
    
    if CONFIG['create_subset']:
        subset_dir = f"ucf_subset_{CONFIG['images_per_class']}_per_class"
        CONFIG['train_dir'] = create_balanced_subset(
            CONFIG['train_dir'], 
            subset_dir, 
            CONFIG['images_per_class']
        )
    

    fine_tuner = FewShotCLIPFineTuner(num_classes=CONFIG['num_classes'])
    
    
    full_dataset = FewShotCrimeDataset(
        CONFIG['train_dir'], 
        fine_tuner.processor, 
        crime_classes,
        images_per_class=CONFIG['images_per_class'],
        split='full',
        use_augmentation=True
    )
    
    
    val_size = int(0.2 * len(full_dataset))
    train_size = len(full_dataset) - val_size
    train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
    
    
    val_dataset.dataset.use_augmentation = False
    
    
    train_loader = DataLoader(
        train_dataset, 
        batch_size=CONFIG['batch_size'], 
        shuffle=True,
        collate_fn=fine_tuner.custom_collate_fn,
        num_workers=2,
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset, 
        batch_size=CONFIG['batch_size'], 
        shuffle=False,
        collate_fn=fine_tuner.custom_collate_fn,
        num_workers=2,
        pin_memory=True
    )
    
    print(f"📊 Few-shot split: {train_size:,} train, {val_size:,} validation")
    

    optimizer = optim.AdamW([
        {'params': fine_tuner.model.parameters(), 'lr': CONFIG['learning_rate']},
        {'params': fine_tuner.classifier.parameters(), 'lr': CONFIG['learning_rate'] * 5}
    ], weight_decay=CONFIG['weight_decay'])
    
    criterion = nn.CrossEntropyLoss()
    
    total_steps = len(train_loader) * CONFIG['epochs']
    scheduler = optim.lr_scheduler.CosineAnnealingLR(
        optimizer, 
        T_max=total_steps,
        eta_min=CONFIG['learning_rate'] * 0.01
    )
    
    best_acc = 0.0
    patience = 3
    patience_counter = 0
    
    training_info = {
        'images_per_class': CONFIG['images_per_class'],
        'total_images': len(full_dataset),
        'training_time': 0
    }
    
    start_time = time.time()
    
    for epoch in range(CONFIG['epochs']):
        print(f"\n{'='*60}")
        print(f"Epoch {epoch+1}/{CONFIG['epochs']} - Few-Shot Training")
        print(f"{'='*60}")
        
        train_loss, train_acc = fine_tuner.train_epoch(
            train_loader, optimizer, criterion, epoch, scheduler
        )
        
        val_loss, val_acc, class_accuracies, avg_confidence = fine_tuner.validate(val_loader, criterion)
        
        print(f"📈 Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        print(f"📉 Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
        print(f"🎯 Avg Confidence: {avg_confidence:.3f}")
        
        print("🎯 Per-class validation accuracies:")
        for class_name, acc in class_accuracies.items():
            emoji = "✅" if acc > 70 else "⚠️" if acc > 50 else "❌"
            print(f"  {emoji} {class_name:15}: {acc:.1f}%")
        
        if val_acc > best_acc:
            best_acc = val_acc
            training_info['training_time'] = time.time() - start_time
            fine_tuner.save_model(
                CONFIG['save_path'], epoch, best_acc, 
                class_accuracies, avg_confidence, training_info
            )
            print(f"🎯 New best validation accuracy: {best_acc:.2f}%")
            patience_counter = 0
        else:
            patience_counter += 1
        
        if patience_counter >= patience:
            print(f"⏰ Early stopping: no improvement for {patience} epochs")
            break
        
        current_lr = optimizer.param_groups[0]['lr']
        print(f"Learning Rate: {current_lr:.2e}")
    
    total_time = time.time() - start_time
    
    print(f"\n🏆 Few-shot training completed in {total_time/60:.1f} minutes!")
    print(f"🎯 Best validation accuracy: {best_acc:.2f}%")
    print(f"💾 Model saved to: {CONFIG['save_path']}")
    print(f"📸 Trained on only {CONFIG['images_per_class']} images per class")
    print(f"⚡ Total images used: {len(full_dataset):,} (vs {318577:,} full dataset)")
    print(f"🚀 Training speedup: ~{318577/len(full_dataset):.1f}x faster!")

if __name__ == "__main__":
    import time
    main() 