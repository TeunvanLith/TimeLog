// DOM Elements
const loginScreen = document.getElementById("loginScreen")
const registerScreen = document.getElementById("registerScreen")
const loggingScreen = document.getElementById("loggingScreen")
const showRegisterLink = document.getElementById("showRegister")
const showLoginLink = document.getElementById("showLogin")
const loginButton = document.getElementById("loginButton")
const registerButton = document.getElementById("registerButton")
const logButton = document.getElementById("logButton")
const logoutButton = document.getElementById("logoutButton")
const timeLogsBody = document.getElementById("timeLogsBody")

let currentUserID = ""

// Navigation
showRegisterLink.addEventListener("click", () => {
  loginScreen.classList.add("hidden")
  registerScreen.classList.remove("hidden")
})

showLoginLink.addEventListener("click", () => {
  registerScreen.classList.add("hidden")
  loginScreen.classList.remove("hidden")
})

// Login
loginButton.addEventListener("click", async () => {
  const userID = document.getElementById("loginUserID").value
  const pincode = document.getElementById("loginPincode").value

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID, pincode }),
    })

    if (response.ok) {
      currentUserID = userID
      loginScreen.classList.add("hidden")
      loggingScreen.classList.remove("hidden")
      fetchTimeLogs()
    } else {
      alert("Invalid credentials")
    }
  } catch (error) {
    console.error("Error during login:", error)
    alert("An error occurred during login")
  }
})

// Registration
registerButton.addEventListener("click", async () => {
  const name = document.getElementById("registerName").value
  const company = document.getElementById("registerCompany").value
  const pincode = document.getElementById("registerPincode").value
  const userID = generateUserID()
  document.getElementById("registerUserID").value = userID

  try {
    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, company, userID, pincode }),
    })

    if (response.ok) {
      alert("Registered successfully! Your User ID is: " + userID)
      registerScreen.classList.add("hidden")
      loginScreen.classList.remove("hidden")
    } else {
      alert("Error during registration")
    }
  } catch (error) {
    console.error("Error during registration:", error)
    alert("An error occurred during registration")
  }
})

// Time Logging
logButton.addEventListener("click", async () => {
  const date = document.getElementById("logDate").value
  const hours = document.getElementById("logHours").value
  const project = document.getElementById("logProject").value
  const remarks = document.getElementById("logRemarks").value

  try {
    const response = await fetch("http://localhost:3000/log-time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: currentUserID, date, hours, project, remarks }),
    })

    if (response.ok) {
      alert("Time logged successfully!")
      fetchTimeLogs()
      clearLogForm()
    } else {
      alert("Error logging time")
    }
  } catch (error) {
    console.error("Error logging time:", error)
    alert("An error occurred while logging time")
  }
})

// Fetch Time Logs
async function fetchTimeLogs() {
  try {
    const response = await fetch(`http://localhost:3000/time-logs/${currentUserID}`)
    const timeLogs = await response.json()
    displayTimeLogs(timeLogs)
  } catch (error) {
    console.error("Error fetching time logs:", error)
    alert("An error occurred while fetching time logs")
  }
}

// Display Time Logs
function displayTimeLogs(timeLogs) {
  timeLogsBody.innerHTML = ""
  timeLogs.forEach((log) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td class="border p-2">${new Date(log.date).toLocaleDateString()}</td>
            <td class="border p-2">${log.hours}</td>
            <td class="border p-2">${log.project}</td>
            <td class="border p-2">${log.remarks}</td>
            <td class="border p-2">
                <button class="bg-yellow-500 text-white p-1 rounded mr-1" onclick="editTimeLog('${log._id}')">Edit</button>
                <button class="bg-red-500 text-white p-1 rounded" onclick="deleteTimeLog('${log._id}')">Delete</button>
            </td>
        `
    timeLogsBody.appendChild(row)
  })
}

// Edit Time Log
async function editTimeLog(id) {
  const newHours = prompt("Enter new hours:")
  if (newHours === null) return

  try {
    const response = await fetch(`http://localhost:3000/time-logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours: newHours }),
    })

    if (response.ok) {
      alert("Time log updated successfully")
      fetchTimeLogs()
    } else {
      alert("Error updating time log")
    }
  } catch (error) {
    console.error("Error updating time log:", error)
    alert("An error occurred while updating the time log")
  }
}

// Delete Time Log
async function deleteTimeLog(id) {
  if (!confirm("Are you sure you want to delete this time log?")) return

  try {
    const response = await fetch(`http://localhost:3000/time-logs/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      alert("Time log deleted successfully")
      fetchTimeLogs()
    } else {
      alert("Error deleting time log")
    }
  } catch (error) {
    console.error("Error deleting time log:", error)
    alert("An error occurred while deleting the time log")
  }
}

// Logout
logoutButton.addEventListener("click", () => {
  currentUserID = ""
  loggingScreen.classList.add("hidden")
  loginScreen.classList.remove("hidden")
  clearLogForm()
})

// Helper Functions
function generateUserID() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

function clearLogForm() {
  document.getElementById("logDate").value = ""
  document.getElementById("logHours").value = ""
  document.getElementById("logProject").value = ""
  document.getElementById('logRemarks').value = "";
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  // Show login screen by default
  loginScreen.classList.remove("hidden")
})

