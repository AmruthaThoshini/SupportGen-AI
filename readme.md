# SupportGen AI — Fine-Tuned Customer Support Intelligence System

**GitHub Repository:** [SupportGen AI](https://github.com/AmruthaThoshini/SupportGen-AI)

SupportGen AI is an AI-powered customer support intelligence system that analyzes customer messages and generates structured support recommendations. It predicts the customer support category and intent, then generates a suggested reply using a fine-tuned Large Language Model (LLM).

The project combines parameter-efficient fine-tuning, a Flask backend, and a web-based dashboard to demonstrate an end-to-end Generative AI application.

## Features

- **Customer Message Analysis:** Analyzes customer support messages using a fine-tuned language model.
- **Category Prediction:** Identifies the relevant support category.
- **Intent Classification:** Predicts the customer's intent.
- **AI-Generated Replies:** Generates contextual suggested responses.
- **Interactive Dashboard:** Provides a simple web interface for submitting messages and viewing predictions.
- **Recent Activity:** Stores recent analysis history in the browser.
- **Flask REST API:** Connects the frontend to the model inference service.
- **Input Validation:** Handles empty messages, invalid requests, and oversized inputs.
- **Safe Response Handling:** Presents AI-generated suggestions without falsely claiming that an order, cancellation, or refund has been processed.

## Tech Stack

**Programming and Data**
- Python
- Pandas
- Scikit-learn

**Generative AI and Fine-Tuning**
- Qwen2.5-1.5B-Instruct
- Hugging Face Transformers
- PEFT (LoRA)
- BitsAndBytes 4-bit quantization
- PyTorch

**Backend**
- Flask
- Flask-CORS
- Requests

**Frontend**
- HTML
- CSS
- JavaScript

**Development Environment**
- Google Colab
- Visual Studio Code
- Git and GitHub
- ngrok for temporary API tunneling

## System Architecture

1. The user enters a customer message in the web dashboard.
2. The frontend sends the message to the local Flask backend.
3. The backend forwards the request to the model inference API hosted in Google Colab.
4. The fine-tuned model predicts the support category and intent and generates a suggested reply.
5. The backend validates the response and returns it to the frontend.
6. The dashboard displays the results and saves recent activity in the browser.

## Model and Fine-Tuning

The project uses **Qwen/Qwen2.5-1.5B-Instruct** as the base language model.

The model was fine-tuned using **Low-Rank Adaptation (LoRA)**, a parameter-efficient fine-tuning technique that trains adapter parameters rather than updating all the original model weights.

The training workflow uses:
- Four-bit model quantization
- LoRA adapters
- Hugging Face Transformers and PEFT
- Google Colab for model training and inference

The fine-tuned adapter is kept separate from the main application code and is not included in the Git repository by default.

## Dataset

The project uses the [Bitext Customer Support LLM Chatbot Training Dataset](https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset).

The dataset contains customer support instructions, categories, intents, and responses.

**Dataset preparation:**
- Checked for missing values and duplicate records.
- Prepared the dataset for supervised fine-tuning.
- Split the data into training, validation, and test sets.
- Used stratified splitting by intent with a fixed random seed.

| Dataset split | Records |
|---|---:|
| Training | 21,497 |
| Validation | 2,687 |
| Test | 2,688 |
| **Total** | **26,872** |

The test set was reserved for evaluation.

## Preliminary Evaluation

An initial evaluation was performed on the first 50 examples from the held-out test set.

| Metric | Result |
|---|---:|
| Category accuracy | 100% |
| Intent accuracy | 98% |

These are **preliminary results from a 50-example sample**, not results for the complete test set. They should not be interpreted as the model's overall accuracy.

The evaluation measured category and intent prediction. The quality and factual correctness of generated replies require additional assessment.

## Project Structure

```text
SupportGen-AI/
├── backend/
│   ├── app.py
│   └── model_service.py
├── Frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── data/
├── inspect_dataset.py
├── prepare_dataset.py
├── split_dataset.py
├── requirements.txt
├── .gitignore
└── readme.md
```

The adapter files, locally stored datasets, and other large model artifacts are excluded from the repository by default.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/AmruthaThoshini/SupportGen-AI.git
cd SupportGen-AI
```

### 2. Create a Virtual Environment

On Windows:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

If `requirements.txt` is present:

```bash
pip install -r requirements.txt
```

Ensure the requirements file includes the Python packages needed by the backend and data-preparation scripts.

### 4. Configure Model Inference

The backend expects a running model inference service. In this project, inference runs in Google Colab and is exposed through a temporary ngrok tunnel.

Configure the following environment variables in the same PowerShell terminal used to start the backend:

```powershell
$env:SUPPORTGEN_COLAB_URL = "YOUR_ACTIVE_COLAB_NGROK_URL"
$env:SUPPORTGEN_API_KEY = "YOUR_PRIVATE_API_KEY"
```

Replace the example values with your own active URL and private API key. **Never commit real API keys or ngrok tokens to GitHub.**

The Colab runtime, Flask inference server, and ngrok tunnel must remain active while using the integrated application. The ngrok URL may change when the tunnel restarts.

### 5. Start the Backend

From the project root:

```powershell
python backend/app.py
```

The backend runs locally at:

```text
http://127.0.0.1:5000
```

Health check:

```text
http://127.0.0.1:5000/api/health
```

### 6. Open the Frontend

Open `Frontend/index.html` in your browser while the backend and Colab inference service are running.

Enter a customer message and select **Analyze message** to view the predicted category, intent, and suggested reply.

## API Endpoints

### Health Check

`GET /api/health`

Returns the backend status and model connectivity status.

### Predict Customer Support Message

`POST /api/predict`

Example request:

```json
{
  "message": "I was charged twice for my order. Could you please help me?"
}
```

Example response:

```json
{
  "category": "PAYMENT",
  "intent": "payment_issue",
  "suggested_reply": "Thank you for bringing this to our attention. Please provide your order or transaction details so we can investigate the duplicate charge."
}
```

The exact response depends on the model prediction.

## Limitations

- The current inference setup depends on Google Colab and a temporary ngrok tunnel.
- Availability and response time depend on the Colab runtime and its resources.
- Preliminary evaluation results cover only 50 held-out examples.
- Generated replies may occasionally contain incorrect predictions, placeholders, or incomplete information.
- The system provides recommendations; it does not directly process refunds, cancel orders, or modify customer accounts.
- Production use would require more extensive evaluation, monitoring, security controls, and reliable model hosting.

## Future Improvements

- Evaluate category and intent performance across the complete held-out test set.
- Add automated tests for API endpoints and response validation.
- Improve response quality and reduce hallucinations.
- Add confidence scores and clearer handling of uncertain predictions.
- Deploy the inference service to a persistent hosting environment.
- Improve authentication, logging, monitoring, and production security.

## License and Attribution

The base model and dataset are subject to their respective licenses and terms of use. Review the [Qwen2.5-1.5B-Instruct model page](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct) and the [Bitext dataset page](https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset) before redistribution or commercial use.

## Author

**Amrutha Thoshini**

GitHub: [AmruthaThoshini](https://github.com/AmruthaThoshini)

**Project Repository:** [SupportGen AI](https://github.com/AmruthaThoshini/SupportGen-AI)
