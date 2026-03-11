import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * MEDMIND PRO - THIẾT KẾ LUXURY DASHBOARD
 * Tiêu chuẩn: Tối giản, Chuyên nghiệp, Hiệu suất cao
 */
const App = () => {
  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [triageData, setTriageData] = useState({
    priority: "STABLE",
    risk: 0,
    vitals: { hr: "--", temp: "--" },
    diagnosis: "Đang chờ dữ liệu..."
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const scrollRef = useRef(null);

  // --- LOGIC XỬ LÝ ---
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendToAI = async (text, img = null) => {
    if (!text && !img) return;
    
    setLoading(true);
    const userMessage = { 
        role: "user", 
        text: text || "Gửi hình ảnh xét nghiệm/vết thương", 
        img: img,
        time: new Date().toLocaleTimeString() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://localhost:4000/api/v1/medical/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          image: img,
          history: messages.slice(-10) // Gửi 10 câu gần nhất để giữ ngữ cảnh
        })
      });

      const data = await response.json();
      
      // Cập nhật Dashboard y tế
      setTriageData({
        priority: data.priority,
        risk: data.risk_score || 0,
        vitals: { hr: data.vitals_prediction?.heart_rate || "--", temp: data.vitals_prediction?.temp || "--" },
        diagnosis: data.diagnosis_preview
      });

      const aiMessage = {
        role: "model",
        text: data.clinical_reasoning,
        priority: data.priority,
        instruction: data.emergency_instructions,
        question: data.next_investigation_question,
        time: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error("Frontend Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES OBJECT ---
  const s = {
    wrapper: { display: 'flex', height: '100vh', background: '#f0f2f5', color: '#1c1e21', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' },
    sidebar: { 
        width: sidebarOpen ? '320px' : '0', 
        background: '#fff', 
        borderRight: '1px solid #ddd', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
        overflow: 'hidden',
        position: 'relative'
    },
    main: { flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' },
    header: { height: '65px', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 25px', justifyContent: 'space-between', borderBottom: '1px solid #e1e4e8' },
    
    // Dashboard Components
    card: { background: '#fff', borderRadius: '14px', padding: '20px', margin: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' },
    statusIndicator: { 
        padding: '10px 15px', 
        borderRadius: '8px', 
        fontWeight: 'bold', 
        fontSize: '13px',
        background: triageData.priority === 'CRITICAL' ? '#fff1f0' : '#f6ffed',
        color: triageData.priority === 'CRITICAL' ? '#cf1322' : '#389e0d',
        border: `1px solid ${triageData.priority === 'CRITICAL' ? '#ffa39e' : '#b7eb8f'}`
    },
    
    // Chat UI
    scrollArea: { flex: 1, overflowY: 'auto', padding: '30px 10%', display: 'flex', flexDirection: 'column', gap: '25px' },
    userRow: { display: 'flex', justifyContent: 'flex-end' },
    aiRow: { display: 'flex', justifyContent: 'flex-start' },
    userBubble: { background: '#1877f2', color: '#fff', padding: '14px 18px', borderRadius: '18px 18px 2px 18px', maxWidth: '75%', boxShadow: '0 2px 8px rgba(24, 119, 242, 0.2)' },
    aiBubble: { background: '#fff', border: '1px solid #e4e6eb', padding: '20px', borderRadius: '18px 18px 18px 2px', maxWidth: '85%', position: 'relative' },
    
    // Input Bar
    inputContainer: { padding: '20px 10%', background: '#fff', borderTop: '1px solid #eee' },
    pill: { display: 'flex', background: '#f0f2f5', borderRadius: '30px', padding: '8px 20px', alignItems: 'center' },
    textInput: { flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', padding: '10px' },
    
    // Decorative
    badge: { fontSize: '10px', textTransform: 'uppercase', color: '#8e9aaf', marginBottom: '5px', display: 'block', fontWeight: 'bold' }
  };

  return (
    <div style={s.wrapper}>
      {/* SIDEBAR: DASHBOARD CÁC CHỈ SỐ */}
      <aside style={s.sidebar}>
        <div style={{padding: '25px', textAlign: 'center', borderBottom: '1px solid #f0f0f0'}}>
          <h2 style={{color: '#1877f2', margin: 0, letterSpacing: '-1px'}}>✚ MEDMIND PRO</h2>
        </div>

        <div style={s.card}>
          <span style={s.badge}>Chẩn đoán lâm sàng</span>
          <p style={{fontSize: '14px', margin: '5px 0', lineHeight: 1.4}}>{triageData.diagnosis}</p>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
          <div style={s.card}>
            <span style={s.badge}>Nguy cơ</span>
            <h2 style={{margin: 0, color: triageData.risk > 70 ? '#ff4d4f' : '#1877f2'}}>{triageData.risk}%</h2>
          </div>
          <div style={s.card}>
            <span style={s.badge}>Nhịp tim (Dự kiến)</span>
            <h2 style={{margin: 0}}>{triageData.vitals.hr}</h2>
          </div>
        </div>

        <div style={{flex: 1}}></div>
        
        <div style={{padding: '20px'}}>
            <button 
                style={{width: '100%', padding: '14px', borderRadius: '10px', background: '#1877f2', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer'}}
                onClick={() => window.location.reload()}
            >
                BẮT ĐẦU PHIÊN MỚI
            </button>
        </div>
      </aside>

      {/* KHÔNG GIAN LÀM VIỆC CHÍNH */}
      <main style={s.main}>
        <header style={s.header}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}>☰</button>
          <div style={s.statusIndicator}>Trạng thái: {triageData.priority}</div>
          <button style={{background: '#f0f2f5', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer'}} onClick={() => window.print()}>📥 Xuất PDF</button>
        </header>

        <section style={s.scrollArea}>
          {messages.length === 0 ? (
            <div style={{textAlign: 'center', marginTop: '15vh', opacity: 0.5}}>
              <div style={{fontSize: '50px'}}>🩺</div>
              <h3>Hệ thống Sàng lọc Y tế Trực tuyến</h3>
              <p>Mô tả tình trạng của bạn để bắt đầu phân tích...</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={m.role === 'user' ? s.userRow : s.aiRow}>
                <div style={m.role === 'user' ? s.userBubble : s.aiBubble}>
                  {m.img && <img src={m.img} style={{width: '100%', borderRadius: '10px', marginBottom: '15px'}} alt="clincal-scan" />}
                  
                  {m.role === 'model' ? (
                    <div>
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                      
                      <div style={{marginTop: '15px', padding: '15px', background: m.priority === 'CRITICAL' ? '#fff1f0' : '#f9f9f9', borderRadius: '10px'}}>
                        <b style={{color: '#ff4d4f'}}>🚑 Chỉ dẫn khẩn cấp:</b>
                        <p style={{margin: '5px 0', fontSize: '14px'}}>{m.instruction}</p>
                      </div>

                      <div style={{marginTop: '15px', color: '#1877f2', fontWeight: 'bold'}}>
                        ➜ {m.question}
                      </div>
                    </div>
                  ) : <span>{m.text}</span>}
                  
                  <span style={{fontSize: '10px', opacity: 0.5, display: 'block', marginTop: '10px', textAlign: 'right'}}>{m.time}</span>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </section>

        <footer style={s.inputContainer}>
          <div style={s.pill}>
            <label style={{cursor: 'pointer', fontSize: '20px', padding: '5px'}}>
              📷
              <input type="file" hidden onChange={(e) => {
                const reader = new FileReader();
                reader.onload = () => sendToAI(null, reader.result);
                reader.readAsDataURL(e.target.files[0]);
              }}/>
            </label>
            <input 
              style={s.textInput} 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendToAI(input)}
              placeholder="Mô tả chi tiết triệu chứng (VD: Đau bụng dưới âm ỉ 2 tiếng)..."
            />
            <button 
                onClick={() => sendToAI(input)} 
                style={{background: 'none', border: 'none', color: '#1877f2', fontSize: '24px', cursor: 'pointer', opacity: loading ? 0.3 : 1}}
                disabled={loading}
            >
              {loading ? "..." : "➤"}
            </button>
          </div>
          <p style={{textAlign: 'center', fontSize: '11px', color: '#8e9aaf', marginTop: '10px'}}>
            Lưu ý: AI hỗ trợ sàng lọc, không thay thế chẩn đoán của bác sĩ chuyên khoa.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;