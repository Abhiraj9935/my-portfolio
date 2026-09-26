// Import Firebase Firestore modules via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
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

// Helper function to attach delete event listeners to all trash buttons
function attachDeleteListeners() {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = e.currentTarget.getAttribute("data-id");
            if (confirm("Are you sure you want to delete this project?")) {
                try {
                    await deleteDoc(doc(db, "projects", id));
                    loadProjects(); // Reload grids after deletion
                } catch (err) {
                    console.error("Error deleting document:", err);
                    alert("Failed to delete project. Check database security rules.");
                }
            }
        });
    });
}

// Function to fetch, filter, and display projects from Firestore
async function loadProjects() {
    const personalContainer = document.getElementById("personalProjectContainer"); // My Works Section
    const communityContainer = document.getElementById("projectContainer");        // Community Section

    try {
        const querySnapshot = await getDocs(collection(db, "projects"));

        // Clear containers before rendering fresh data
        if (personalContainer) personalContainer.innerHTML = "";
        if (communityContainer) communityContainer.innerHTML = "";

        if (querySnapshot.empty) {
            if (communityContainer) {
                communityContainer.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">No community projects found yet.</p>`;
            }
            return;
        }

        let personalCount = 0;
        let communityCount = 0;

        querySnapshot.forEach((documentSnap) => {
            const data = documentSnap.data();
            const docId = documentSnap.id;

            // Create individual project card element
            const card = document.createElement("div");
            card.className = "project-card";

            card.innerHTML = `
                <div>
                    <div class="card-header">
                        <span class="card-tag">${data.tag || "Project"}</span>
                        <button class="delete-btn" data-id="${docId}" title="Delete Project">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                    <h3>${data.title || "Untitled Project"}</h3>
                    <p>${data.description || "No description provided."}</p>
                </div>
                <div class="card-footer" style="margin-top: 15px;">
                    <a href="${data.link || '#'}" target="_blank" rel="noopener noreferrer" class="card-link">
                        View Project <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            `;

            // ROUTING LOGIC:
            // Projects with type "personal" go to My Works. All others go to Community Feed.
            if (data.type === "personal") {
                if (personalContainer) {
                    personalContainer.appendChild(card);
                    personalCount++;
                }
            } else {
                if (communityContainer) {
                    communityContainer.appendChild(card);
                    communityCount++;
                }
            }
        });

        // Show empty message for Community if no user submissions exist yet
        if (communityCount === 0 && communityContainer) {
            communityContainer.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">No community submissions yet. Be the first to post!</p>`;
        }

        // Attach delete functionality to newly created cards
        attachDeleteListeners();

    } catch (error) {
        console.error("Firebase Fetch Error:", error);
        if (communityContainer) {
            communityContainer.innerHTML = `<p style="color: #ef4444; grid-column: 1/-1;">Failed to load projects from database.</p>`;
        }
    }
}

// Function to handle visitor project submissions
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
        formStatus.textContent = "Posting project to database...";

        try {
            // Save document into Firestore 'projects' collection as 'community' type
            await addDoc(collection(db, "projects"), {
                title: title,
                tag: tag,
                description: description,
                link: link,
                type: "community" // Automatically tagged as community contribution
            });

            formStatus.style.color = "#10b981";
            formStatus.textContent = "Project published successfully!";

            addProjectForm.reset();

            // Refresh project feeds automatically
            loadProjects();

        } catch (error) {
            console.error("Error adding document: ", error);
            formStatus.style.color = "#ef4444";
            formStatus.textContent = "Failed to post project. Check database connection.";
        }
    });
}

// Initial load on page start
loadProjects();
