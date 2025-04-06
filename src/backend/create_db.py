from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import shutil
import os
import PyPDF2

CHROMA_PATH = "chroma"
BASE_PATH = r"C:\Users\veara\Downloads\finalpdf\finalpdf"
DATA_FOLDERS = ["admin", "contractor", "manager", "interns", "Common"]

def main():
    generate_data_store()

def generate_data_store():
    documents = load_documents()
    chunks = split_text(documents)
    save_to_chroma(chunks)

def load_documents():
    documents = []
    for folder in DATA_FOLDERS:
        folder_path = os.path.join(BASE_PATH, folder)
        if not os.path.exists(folder_path):
            print(f"Warning: Folder {folder_path} not found")
            continue
        
        for filename in os.listdir(folder_path):
            if filename.endswith(".pdf"):
                file_path = os.path.join(folder_path, filename)
                try:
                    with open(file_path, "rb") as file:
                        pdf_reader = PyPDF2.PdfReader(file)
                        text = ""
                        for page in pdf_reader.pages:
                            text += page.extract_text() or ""
                        
                        metadata = {
                            "source": filename,
                            "role": folder
                        }
                        documents.append(Document(page_content=text, metadata=metadata))
                except Exception as e:
                    print(f"Error processing {filename}: {str(e)}")
    
    print(f"Loaded {len(documents)} PDF documents")
    return documents

def split_text(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")
    return chunks

def save_to_chroma(chunks: list[Document]):
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)
    
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    db = Chroma.from_documents(
        chunks,
        embeddings,
        persist_directory=CHROMA_PATH
    )
    db.persist()
    print(f"Saved {len(chunks)} chunks to {CHROMA_PATH}.")

if __name__ == "__main__":
    main()