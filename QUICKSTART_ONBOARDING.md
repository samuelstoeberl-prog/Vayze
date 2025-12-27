# Quick Start: Account Management Integration

## 🚀 In 3 Schritten integriert

### **Schritt 1: Import hinzufügen**

In deiner `App.js` (oder wo du deine Tabs/Navigation hast):

```javascript
import AccountScreen from './screens/AccountScreen';
```

---

### **Schritt 2: Screen in Navigation integrieren**

**Option A - Als neuer Tab (empfohlen):**

```javascript
// In App.js bei deinen anderen Tabs:
{activeTab === 4 && <AccountScreen />}

// Und füge einen Tab-Button hinzu:
<TouchableOpacity onPress={() => setActiveTab(4)}>
  <Text>⚙️ Einstellungen</Text>
</TouchableOpacity>
```

**Option B - In bestehendem Settings-Tab:**

```javascript
// In deinem Settings-Tab:
const [showAccount, setShowAccount] = useState(false);

{showAccount ? (
  <AccountScreen />
) : (
  <View>
    <TouchableOpacity onPress={() => setShowAccount(true)}>
      <Text>Konto-Einstellungen</Text>
    </TouchableOpacity>
    {/* Deine anderen Settings */}
  </View>
)}
```

---

### **Schritt 3: Testen**

1. ✅ Öffne die App
2. ✅ Navigiere zu AccountScreen
3. ✅ Teste "Abmelden"
4. ✅ Teste "Konto löschen"

**Fertig! 🎉**

---

## 🔐 Session-Persistenz

**Bereits aktiv - keine Aktion nötig!**

Die Session-Persistenz funktioniert automatisch über `AuthContext.js`:

- ✅ User muss sich nur **1x** anmelden
- ✅ Session bleibt **7 Tage** gültig
- ✅ Auto-Logout nach **30 Min** Inaktivität
- ✅ Revalidierung beim **App-Foreground**

---

## 🎨 Design anpassen (optional)

In `screens/AccountScreen.js` am Ende der Datei:

```javascript
const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: '#4A90E2',  // ← Deine Farbe hier
  },
  // ... weitere Styles
});
```

---

## 📝 Vollständige Doku

Für Details siehe: `ACCOUNT_INTEGRATION_GUIDE.md`

---

## ✅ Checkliste

- [ ] `AccountScreen.js` importiert
- [ ] In Navigation integriert
- [ ] Logout getestet
- [ ] Delete Account getestet
- [ ] Session-Persistenz getestet (App schließen & neu öffnen)

**Alles grün? Du bist fertig! 🚀**
