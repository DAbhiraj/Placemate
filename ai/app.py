from flask import Flask, request, jsonify
from langchain_community.document_loaders import PyPDFLoader
from huggingface_hub import InferenceClient
import json, os
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)

# Hugging Face client initialize once
client = InferenceClient(token=os.environ["HF_TOKEN"])
model_id = "mistralai/Mistral-7B-Instruct-v0.2"

schema = {
    "full_name": "",
    "roll_number": "",
    "branch": "",
    "cgpa":"",
    "email": "",
    "phone": "",
    "skills": []
}

def build_prompt(text):
    return f"""
Extract the following details from the resume below.
Return STRICT JSON ONLY — no explanations.

Schema:
{json.dumps(schema, indent=2)}

Resume:
\"\"\"{text}\"\"\"

Return JSON only:
"""

@app.post("/parse-resume")
def parse_resume():
    file = request.files["resume"]
    pdf_path = "../resume.pdf"
    file.save(pdf_path)
    print("loading")
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    resume_text = "\n".join([d.page_content for d in docs])

    prompt = build_prompt(resume_text)

    try:
        # HF chat
        response = client.chat_completion(
            model=model_id,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2048,
            temperature=0.1
        )
        raw = response.choices[0].message.content

        # Clean in case model outputs with code fences
        raw = raw.replace("```json", "").replace("```", "").strip()

        return jsonify({"success": True, "data": json.loads(raw)})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7001)
