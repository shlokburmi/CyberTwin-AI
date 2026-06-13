import os
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.docstore.document import Document

class RAGService:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vectorstore = None
        self._initialize_knowledge_base()

    def _initialize_knowledge_base(self):
        # A simple fake knowledge base
        knowledge_texts = [
            "To prevent brute force attacks, use Multi-Factor Authentication (MFA), rate limiting, and account lockout policies.",
            "SQL Injection (SQLi) can be mitigated by using parameterized queries or prepared statements instead of string concatenation.",
            "Cross-Site Scripting (XSS) is prevented by escaping user input and using Content Security Policy (CSP).",
            "Zero Trust architecture means never trust, always verify. Every access request is fully authenticated, authorized, and encrypted.",
            "Phishing attacks can be reduced through employee training, email filtering, and DMARC/SPF/DKIM implementation.",
            "DDoS mitigation involves traffic analysis, rate limiting, and using a Web Application Firewall (WAF) or CDN."
        ]
        
        docs = [Document(page_content=text) for text in knowledge_texts]
        
        # In MVP, we use an in-memory or ephemeral chromadb store
        self.vectorstore = Chroma.from_documents(docs, self.embeddings)
        print("RAG Knowledge Base initialized.")

    def answer_question(self, question: str) -> str:
        if not self.vectorstore:
            return "Knowledge base is currently unavailable."
            
        docs = self.vectorstore.similarity_search(question, k=1)
        if docs:
            # We skip an LLM layer for MVP simplicity to avoid OpenAI API keys,
            # and just return the most relevant document directly.
            return docs[0].page_content
        else:
            return "I couldn't find an answer to your question in my cybersecurity knowledge base."

rag_service = RAGService()
