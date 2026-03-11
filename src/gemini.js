export const getAIResponse = async (prompt) => {
  try {
    const res = await fetch("http://localhost:4000/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    return data.text;
  } catch (error) {
    return "Lỗi kết nối rồi má ơi!";
  }
};