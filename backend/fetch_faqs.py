import json
import requests

# Fetch the dataset from Hugging Face
print("Fetching FAQ dataset from Hugging Face...")

try:
    # Direct link to the dataset file
    url = "https://huggingface.co/datasets/MakTek/Customer_support_faqs_dataset/resolve/main/data/train-00000-of-00001.parquet"
    
    # Alternative: Use datasets library
    from datasets import load_dataset
    
    dataset = load_dataset("MakTek/Customer_support_faqs_dataset")
    
    # Convert to FAQ format
    faqs = []
    for item in dataset['train']:
        faq = {
            "question": item['question'],
            "answer": item['answer']
        }
        faqs.append(faq)
    
    print(f"✓ Successfully loaded {len(faqs)} FAQs")
    
    # Save to faqs.json
    with open('faqs.json', 'w', encoding='utf-8') as f:
        json.dump(faqs, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved to faqs.json")
    
    # Show first 3 FAQs as preview
    print("\nPreview of first 3 FAQs:")
    for i, faq in enumerate(faqs[:3], 1):
        print(f"\n{i}. Q: {faq['question']}")
        print(f"   A: {faq['answer'][:100]}...")

except ImportError:
    print("❌ 'datasets' library not found. Installing...")
    print("Run: pip install datasets")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nAlternative: Download manually from:")
    print("https://huggingface.co/datasets/MakTek/Customer_support_faqs_dataset")