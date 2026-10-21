
from datasets import load_dataset

# Load the dataset from Hugging Face
ds = load_dataset(
    "bitext/Bitext-customer-support-llm-chatbot-training-dataset"
)

print("Dataset information:")
print(ds)

# Access the training split
data = ds["train"]

print("\nColumn names:")
print(data.column_names)

print("\nTotal examples:", len(data))

print("\nFirst example:")
print(data[0])
