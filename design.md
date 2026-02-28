To achieve "good graphics" and a professional feel, we will use a **Modern Dark Mode** aesthetic with **Glassmorphism** (semi-transparent backgrounds). This design ensures the app looks like a high-end productivity tool rather than a basic utility.

### **I. Visual Identity & UI Style**

* **Theme:** Deep Charcoal (`#121212`) background with "Electric Violet" (`#8B5CF6`) accents.
* **Typography:** Sans-serif (Inter or Roboto) for a clean, technical look.
* **Cards:** Each question should be a "glass" card with a subtle border and 10% background opacity.
* **Animations:** Use CSS transitions for the pop-up entrance (e.g., a "Scale Up" or "Blur-to-Focus" effect) to make the interruption feel deliberate but polished.

---

### **II. The "Enforcer" Logic (System Specs)**

To meet your requirement of a window that **cannot be hidden**, the Electron Main Process must use these specific window configurations:

| Feature | Electron Setting | Purpose |
| --- | --- | --- |
| **Always on Top** | `alwaysOnTop: true` | Floats above all other windows (Browsers, IDEs, etc). |
| **Kiosk Mode** | `kiosk: true` | Optional: Disables system shortcuts (Cmd+Tab, Alt+Tab) to force focus. |
| **No Frame** | `frame: false` | Removes standard minimize/close buttons for a custom UI. |
| **Focus Grab** | `win.focus()` | Programmatically pulls the window to the front when the timer ends. |

---

### **III. The 10-Question Data Schema**

The UI will present these 10 fields. Each must be "validated" (checked for content) before the **"Unlock & Save"** button becomes active.

1. **Activity:** "What exactly did I do in the last hour?" (Text Area)
2. **Output:** "What was the tangible result (draft, code, decision)?" (Text Area)
3. **Method:** "Which specific tool did I use (e.g., SCAMPER, TRIZ, ToT)?" (Dropdown/Input)
4. **Utility:** "On a scale of 1-10, how useful was this hour?" (Slider)
5. **Friction:** "Where did I get stuck or feel resistance?" (Text Area)
6. **Uncertainty:** "Did my uncertainty increase or decrease?" (Toggle/Radio)
7. **Hypothesis:** "Is my current working hypothesis still valid?" (Yes/No + Note)
8. **Next Step:** "What is the single most important task for the next hour?" (Text Area)
9. **Pivot:** "Do I need to change my current method or tool?" (Yes/No)
10. **Quick Win:** "What is one 2-minute task I can finish right now?" (Small Input)

---

### **IV. File System & Output Structure**

The app will use the Node.js `fs` module to append data.

**File Name:** `Work_Log_2026.md`
**Format:**

```markdown
# [2026-02-28 | 10:00 AM] Session Log
---
- **Activity:** Drafted the architecture for the Electron enforcer.
- **Output:** Completed design specifications.
- **Method:** Structured Thinking (ToT).
- **Utility:** 9/10
- **Friction:** UI design took longer than expected.
- **Uncertainty:** Decreased; path is clear.
- **Hypothesis:** Valid.
- **Next Step:** Coding the Main Process in Electron.
- **Pivot:** No.
- **Quick Win:** Initialize git repository.
---

```

---

### **V. Technical Stack Recommendation**

* **Framework:** Electron (Main process).
* **Frontend:** Vite + React (For smooth UI state management).
* **Styling:** Tailwind CSS (For the "good graphics" and easy dark mode).
* **Icons:** Lucide-React (For minimalist, modern iconography).
