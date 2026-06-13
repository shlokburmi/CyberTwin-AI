"""
RAG Service — Retrieval-Augmented Generation for cybersecurity Q&A.

Uses ChromaDB for vector storage, HuggingFace embeddings for retrieval,
and Groq's LLM for intelligent response generation.

Provides:
- answer_question(): interactive chatbot for user questions
- get_mitigation(): automated mitigation recommendations for detected attacks
"""

import os
from dotenv import load_dotenv
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_groq import ChatGroq

load_dotenv()


# ── Comprehensive Cybersecurity Knowledge Base ────────────────────

KNOWLEDGE_BASE = [
    # OWASP Top 10
    "To prevent brute force attacks, use Multi-Factor Authentication (MFA), rate limiting, account lockout policies, and CAPTCHA after repeated failures. Monitor for distributed brute force attempts across multiple accounts.",
    "SQL Injection (SQLi) is the #1 OWASP vulnerability. Mitigate by using parameterized queries, prepared statements, stored procedures, and input validation. Never concatenate user input into SQL queries. Use WAFs as an additional defense layer.",
    "Cross-Site Scripting (XSS) is prevented by escaping user input, using Content Security Policy (CSP) headers, implementing output encoding, and using modern frameworks with built-in XSS protection like React.",
    "Broken Authentication can be prevented by implementing MFA, using strong password policies, session management best practices, and avoiding credential exposure in URLs or logs.",
    "Security Misconfiguration is addressed by hardening server configurations, removing default credentials, disabling directory listings, and implementing automated configuration scanning.",
    "Insecure Direct Object References (IDOR) are prevented by implementing proper access controls, using indirect references, and validating user authorization for every data access request.",

    # MITRE ATT&CK Framework
    "MITRE ATT&CK is a knowledge base of adversary tactics and techniques. It covers 14 tactics: Reconnaissance, Resource Development, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control (C2), Exfiltration, and Impact.",
    "Initial Access techniques in MITRE ATT&CK include phishing (T1566), exploiting public-facing applications (T1190), and valid accounts (T1078). Defense involves email filtering, patch management, and access monitoring.",
    "Lateral Movement in MITRE ATT&CK includes techniques like Remote Services (T1021), Pass the Hash (T1550.002), and Internal Spearphishing (T1534). Prevent with network segmentation, least privilege, and monitoring internal traffic.",
    "Privilege Escalation techniques include exploitation of vulnerabilities, access token manipulation, and sudo/UAC bypass. Mitigate with regular patching, principle of least privilege, and endpoint detection.",

    # NIST Cybersecurity Framework
    "The NIST Cybersecurity Framework consists of five core functions: Identify (asset management, risk assessment), Protect (access control, training), Detect (monitoring, anomaly detection), Respond (incident response, communications), and Recover (recovery planning, improvements).",
    "Zero Trust architecture means never trust, always verify. Every access request must be fully authenticated, authorized, and encrypted regardless of network location. Implement micro-segmentation and continuous verification.",

    # Attack-Specific Defenses
    "Credential stuffing attacks use stolen username/password pairs from data breaches to attempt login on other services. Defend with MFA, credential monitoring services like Have I Been Pwned, rate limiting, and bot detection (CAPTCHA).",
    "Insider threats are among the hardest to detect. Implement User and Entity Behavior Analytics (UEBA), principle of least privilege, audit logging, data loss prevention (DLP), and regular access reviews.",
    "Phishing attacks can be reduced through employee security awareness training, email filtering with SPF/DKIM/DMARC, URL sandboxing, and reporting mechanisms. Advanced phishing uses AI-generated content and requires AI-based detection.",
    "Ransomware defense requires a multi-layered approach: regular offline backups (3-2-1 rule), network segmentation, endpoint detection and response (EDR), email filtering, user training, and incident response planning. Never pay the ransom.",
    "DDoS mitigation involves traffic analysis, rate limiting, anycast network diffusion, Web Application Firewalls (WAF), CDN-based protection, and ISP-level filtering. Use services like Cloudflare or AWS Shield.",

    # CVE Examples
    "Log4Shell (CVE-2021-44228) was a critical RCE vulnerability in Apache Log4j. It allowed attackers to execute arbitrary code via crafted log messages. Mitigate by updating Log4j, removing JndiLookup class, or setting log4j2.formatMsgNoLookups=true.",
    "Heartbleed (CVE-2014-0160) was a buffer over-read vulnerability in OpenSSL's TLS heartbeat extension. It allowed attackers to read server memory, potentially exposing private keys and user data. Patched in OpenSSL 1.0.1g.",
    "EternalBlue (CVE-2017-0144) exploited SMBv1 in Windows. It was used by WannaCry ransomware affecting 200,000+ computers in 150 countries. Always patch SMB vulnerabilities and disable SMBv1.",

    # General Best Practices
    "Defense in Depth is a cybersecurity strategy using multiple layers of security controls: network perimeter, internal network, host, application, and data layers. No single layer should be the only line of defense.",
    "Security Information and Event Management (SIEM) systems aggregate and analyze log data from across an organization to detect threats in real-time. Key features include log correlation, alerting, dashboards, and compliance reporting.",
    "Incident Response follows the NIST framework: Preparation, Detection & Analysis, Containment, Eradication & Recovery, and Post-Incident Activity. Every organization should have a documented IR plan.",
    "Network segmentation divides a network into smaller isolated segments to limit lateral movement. Use VLANs, firewalls, and micro-segmentation to contain breaches and reduce attack surface.",
    "Endpoint Detection and Response (EDR) provides continuous monitoring and response capabilities on endpoints. Key features include behavioral analysis, threat hunting, automated response, and forensic investigation tools.",
]


class RAGService:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vectorstore = None
        self.llm = None

        try:
            self.llm = ChatGroq(
                temperature=0,
                model_name="llama-3.1-8b-instant",
                groq_api_key=os.getenv("GROQ_API_KEY"),
            )
        except Exception as e:
            print(f"Error initializing LLM: {e}")

        self._initialize_knowledge_base()

    def _initialize_knowledge_base(self) -> None:
        """Build the ChromaDB vector store from the knowledge base."""
        docs = [Document(page_content=text) for text in KNOWLEDGE_BASE]
        self.vectorstore = Chroma.from_documents(docs, self.embeddings)
        print(f"RAG Knowledge Base initialized with {len(KNOWLEDGE_BASE)} entries.")

    def answer_question(self, question: str) -> str:
        """Answer a user's cybersecurity question using RAG."""
        if not self.vectorstore:
            return "Knowledge base is currently unavailable."

        if not self.llm:
            return "LLM is not configured. Please set the GROQ_API_KEY environment variable."

        try:
            docs = self.vectorstore.similarity_search(question, k=3)
            if docs:
                context = "\n".join([doc.page_content for doc in docs])
                prompt = (
                    "You are CyberTwin AI Security Assistant, an expert cybersecurity analyst. "
                    "Use the following cybersecurity knowledge context to answer the user's question. "
                    "Be concise, professional, and actionable. Use markdown formatting for "
                    "headers, bullet points, and code blocks where appropriate.\n\n"
                    f"Context:\n{context}\n\n"
                    f"Question: {question}\n\n"
                    "Answer:"
                )
                response = self.llm.invoke(prompt)
                return response.content
            return "I couldn't find relevant information in my knowledge base."
        except Exception as e:
            print(f"RAG error: {e}")
            return f"Error generating response: {str(e)}"

    def get_mitigation(self, attack_type: str, context: dict) -> str:
        """
        Generate an automated mitigation recommendation for a detected attack.
        Used by the simulation engine after ML/DL analysis.
        """
        if not self.llm:
            # Fallback static recommendations
            fallbacks = {
                "brute_force": "Block the attacking IP, enforce MFA, and implement account lockout policies.",
                "credential_stuffing": "Enable MFA, check credentials against breach databases, and implement CAPTCHA.",
                "insider_threat": "Review user access privileges, enable audit logging, and investigate unusual activity.",
                "sql_injection": "Use parameterized queries, deploy a WAF, and review application input validation.",
            }
            return fallbacks.get(attack_type, "Investigate the threat and apply appropriate countermeasures.")

        try:
            affected_ips = ", ".join(context.get("affected_ips", [])[:5]) or "N/A"
            prompt = (
                "You are CyberTwin AI, a cybersecurity incident response system. "
                f"A {attack_type.replace('_', ' ')} attack has been detected.\n\n"
                f"ML Result: {context.get('ml_result', 'N/A')}\n"
                f"DL Prediction: {context.get('dl_prediction', 'N/A')}\n"
                f"Severity: {context.get('severity', 'N/A')}\n"
                f"Affected IPs: {affected_ips}\n\n"
                "Provide a concise (2-3 sentence) mitigation recommendation. "
                "Be specific and actionable."
            )
            response = self.llm.invoke(prompt)
            return response.content
        except Exception as e:
            print(f"RAG mitigation error: {e}")
            return "Investigate the detected threat and apply standard incident response procedures."


rag_service = RAGService()
