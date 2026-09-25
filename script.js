// Import Firebase Firestore functions via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your exact Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEmzeFhRqPkp2RB2_f4INYzQJvfOU7pkM",
  authDomain: "my-portfolio-1e604.firebaseapp.com",
  projectId: "my-portfolio-1e604",
  storageBucket: "my-portfolio-1e604.firebasestorage.app",
  messagingSenderId: "412293128934",
  appId: "1:412293128934:web:064b2eec03a34ee99e5127",
  measurementId: "G-XL43YTLWT3"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch and display projects from Firestore
async function loadProjects() {
    const container = document.getElementById("projectContainer");

    try {
        const querySnapshot = await getDocs(collection(db, "projects"));

        if (querySnapshot.empty) {
            container.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">No projects found in Firestore collection.</p>`;
            return;
        }

        container.innerHTML = ""; // Clear loading state

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            const card = document.createElement("div");
            card.className = "project-card";

            card.innerHTML = `
                <div>
                    <span class="card-tag">${data.tag || "Project"}</span>
                    <h3>${data.title || "Untitled Project"}</h3>
                    <p>${data.description || "No description provided."}</p>
                </div>
                <a href="${data.link || '#'}" target="_blank" rel="noopener noreferrer" class="card-link">
                    View Project <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Firebase Error:", error);
        container.innerHTML = `<p style="color: #ef4444; grid-column: 1/-1;">Failed to load projects.</p>`;
    }
}

// Function to handle new project submission to Firestore
const addProjectForm = document.getElementById("addProjectForm");
const formStatus = document.getElementById("formStatus");

if (addProjectForm) {
    addProjectForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("projTitle").value;
        const tag = document.getElementById("projTag").value;
        const description = document.getElementById("projDesc").value;
        const link = document.getElementById("projLink").value;

        formStatus.style.color = "var(--text-muted)";
        formStatus.textContent = "Posting project to Firebase...";

        try {
            // Save document into Firestore 'projects' collection
            await addDoc(collection(db, "projects"), {
                title: title,
                tag: tag,
                description: description,
                link: link
            });

            formStatus.style.color = "#10b981"; // Green success message
            formStatus.textContent = "Project posted successfully!";

            addProjectForm.reset();

            // Refresh the projects list automatically
            loadProjects();

            // Smooth scroll up to project list
            document.getElementById("projects").scrollIntoView({ behavior: "smooth" });

        } catch (error) {
            console.error("Error adding document: ", error);
            formStatus.style.color = "#ef4444"; // Red error message
            formStatus.textContent = "Failed to post project. Check database permissions.";
        }
    });
}

// Initial load on page start
loadProjects();
