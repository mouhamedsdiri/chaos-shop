// script.js
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll("#vehicle-card");

  cards.forEach((card) => {
    const mainImg = card.querySelector(".main-img");
    const thumbnails = card.querySelectorAll(".image-thumbnails img");
    let index = 0;

    if (thumbnails.length === 0) return;

    setInterval(() => {
      index = (index + 1) % thumbnails.length;
      mainImg.src = thumbnails[index].src;
    }, 5000);
  });
});

// Capture Discord token on redirect
if (window.location.hash.includes("access_token")) {
  const token = window.location.hash
    .slice(1)
    .split("&")
    .find(p => p.startsWith("access_token"))
    .split("=")[1];
  localStorage.setItem("discord_token", token);
  window.location.hash = "";
}
document.getElementById("logoutBtn").addEventListener("click", () => {
  // Clear your session/token/localStorage
  localStorage.removeItem("clientId"); // or your session storage
  sessionStorage.clear();

  // Optional: redirect to your backend logout endpoint
  window.location.href = "http://127.0.0.1:5500/index.html";
  
  // OR: redirect to your home page
  // window.location.href = "/login";
});

async function sendPurchase(type, name, price, image) {
  const token = localStorage.getItem("discord_token");
  if (!token) {
    return alert("❌ Please login with Discord first.");
  }

  // 1) Get user info
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!userRes.ok) {
    return alert("❌ Discord login verification failed.");
  }
  const user = await userRes.json();

  // 2) Send to backend
  const res = await fetch("http://localhost:3000/create-ticket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productName:  name,
      productImage: image,
      username:     user.username,
      userId:       user.id,
      type          // "normal" or "vip"
    })
  });

  const data = await res.json();

  if (res.ok) {
    alert(`✅ Ticket created: ${data.channelName}`);
  } else if (res.status === 400 && data.channelName) {
    alert(`⚠️ ${data.error}\nYour ticket: #${data.channelName}`);
  } else {
    console.error("Backend error:", data);
    alert("❌ Failed to create ticket. See console for details.");
  }
}

function buyItem(name, price, image) {
  sendPurchase("normal", name, price, image);
}

function buyVIPItem(name, price, image) {
  sendPurchase("vip", name, price, image);
}
