// ==========================================
// ১. ফায়ারবেস কনফিগারেশন ও ইনিশিয়ালাইজেশন
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCmoFXa6eYEi-SV_Otk9c-l4TlHWXzMFQU",
  authDomain: "dingel-hafizia-manager.firebaseapp.com",
  projectId: "dingel-hafizia-manager",
  storageBucket: "dingel-hafizia-manager.firebasestorage.app",
  messagingSenderId: "1019481403108",
  appId: "1:1019481403108:web:06b44cac27a54a557d86f1",
  measurementId: "G-FPETR4EDYP"
};

// ফায়ারবেস চালু
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// গ্লোবাল স্টেট
const MADRASA_PASSWORD = "123"; 
let students = [];
let collections = [];
let currentReceiptNo = null;

// INR Currency Format
function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR', 
        maximumFractionDigits: 0 
    }).format(amount);
}

// ==========================================
// ২. ক্লাউড ডাটা ফেচিং (Firestore Realtime/Get)
// ==========================================
async function fetchStudents() {
    try {
        const snapshot = await db.collection('students').get();
        students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderStudents();
    } catch (error) {
        console.error("Error fetching students:", error);
    }
}

async function fetchCollections() {
    try {
        const snapshot = await db.collection('collections').get();
        collections = snapshot.docs.map(doc => doc.data());
        renderStudents();
    } catch (error) {
        console.error("Error fetching collections:", error);
    }
}

// ==========================================
// ৩. লগইন ও নেভিগেশন
// ==========================================
function handleLogin(event) {
    event.preventDefault();
    const inputPassword = document.getElementById('passwordInput').value;
    const errorMessage = document.getElementById('errorMessage');

    if (inputPassword === MADRASA_PASSWORD) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'flex';
        errorMessage.style.display = 'none';
        document.getElementById('passwordInput').value = '';
        fetchStudents();
        fetchCollections();
    } else {
        errorMessage.style.display = 'block';
    }
}

function handleLogout() {
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
}

// ==========================================
// ৪. মডাল টগলস
// ==========================================
function toggleStudentModal() { document.getElementById('studentModal').classList.toggle('hidden'); }
function toggleFeeModal() { document.getElementById('feeModal').classList.toggle('hidden'); }
function toggleReceiptModal() { document.getElementById('receiptModal').classList.toggle('hidden'); }

// ==========================================
// ৫. ইভেন্ট লিসেনার ও ফর্ম সাবমিশন
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // নতুন ছাত্র ফর্ম
    const addForm = document.getElementById('addStudentForm');
    if (addForm) {
        addForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const phoneInput = document.getElementById('guardianPhone').value.trim();
            const indianPhoneRegex = /^[6-9]\d{9}$/;

            if (phoneInput && !indianPhoneRegex.test(phoneInput)) {
                alert('অনুগ্রহ করে সঠিক ১০ সংখ্যার ভারতীয় মোবাইল নম্বর দিন।');
                return;
            }

            const newStudent = {
                name: document.getElementById('studentName').value.trim(),
                class: document.getElementById('studentClass').value.trim(),
                roll: document.getElementById('studentRoll').value.trim(),
                guardian: document.getElementById('guardianName').value.trim(),
                phone: phoneInput || 'N/A',
                type: document.getElementById('studentType').value,
                createdAt: new Date().toISOString()
            };

            try {
                const docRef = await db.collection('students').add(newStudent);
                newStudent.id = docRef.id;
                students.push(newStudent);
                
                this.reset();
                toggleStudentModal();
                renderStudents();
                alert('ছাত্র সফলভাবে ক্লাউডে সেভ হয়েছে!');
            } catch (error) {
                alert('ডাটা সেভ করতে সমস্যা হয়েছে: ' + error.message);
            }
        });
    }

    // ফি জমা ফর্ম
    const payForm = document.getElementById('payFeeForm');
    if (payForm) {
        payForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const studentId = document.getElementById('feeStudentId').value;
            const student = students.find(s => s.id === studentId);

            if (!student) return;

            const amount = parseFloat(document.getElementById('feeAmount').value);
            const month = document.getElementById('feeMonth').value;

            const record = {
                recNo: 'REC-' + Math.floor(10000 + Math.random() * 90000),
                studentId: student.id,
                name: student.name,
                roll: student.roll,
                class: student.class,
                amount: amount,
                month: month,
                date: new Date().toLocaleDateString('bn-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            };

            try {
                await db.collection('collections').add(record);
                collections.push(record);
                toggleFeeModal();
                this.reset();
                renderStudents();
                showReceipt(record);
            } catch (error) {
                alert('ফি জমা সেভ করতে সমস্যা হয়েছে!');
            }
        });
    }

    // সার্চ ইনপুট ফিল্টার
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderStudents(e.target.value.toLowerCase());
        });
    }
});

// ==========================================
// ৬. রেন্ডারিং ও ডাটা ফিল্টারিং
// ==========================================
function renderStudents(searchQuery = '') {
    const tableBody = document.getElementById('studentTableBody');
    const totalStudentsElem = document.getElementById('totalStudents');
    const totalCollectionElem = document.getElementById('totalCollection');

    if (totalStudentsElem) totalStudentsElem.innerText = students.length;

    const totalAmount = collections.reduce((sum, item) => sum + item.amount, 0);
    if (totalCollectionElem) totalCollectionElem.innerText = formatINR(totalAmount);

    if (!tableBody) return;
    tableBody.innerHTML = '';

    const filteredStudents = students.filter(s => 
        (s.name && s.name.toLowerCase().includes(searchQuery)) ||
        (s.roll && s.roll.toString().includes(searchQuery)) ||
        (s.class && s.class.toLowerCase().includes(searchQuery))
    );

    if (filteredStudents.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-slate-400">
                    <i class="fa-solid fa-folder-open text-3xl mb-2 block"></i>
                    ${searchQuery ? 'কোনো ছাত্র পাওয়া যায়নি।' : 'এখনো কোনো ছাত্র ভর্তি করা হয়নি।'}
                </td>
            </tr>
        `;
        return;
    }

    filteredStudents.forEach((student) => {
        let typeBadge = student.type === 'Orphan' 
            ? '<span class="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-semibold">এতিম (ফ্রি)</span>'
            : student.type === 'Poor' 
            ? '<span class="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">গরিব (ফ্রি)</span>'
            : '<span class="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">সাধারণ</span>';

        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 border-b border-slate-100 transition';
        row.innerHTML = `
            <td class="p-4 font-bold text-slate-700">#${student.roll}</td>
            <td class="p-4 font-semibold text-slate-800">${student.name}</td>
            <td class="p-4 text-slate-600">${student.class}</td>
            <td class="p-4">
                <p class="font-medium text-slate-700">${student.guardian}</p>
                <p class="text-xs text-slate-400"><i class="fa-solid fa-phone mr-1"></i>+91 ${student.phone}</p>
            </td>
            <td class="p-4">${typeBadge}</td>
            <td class="p-4 text-center flex items-center justify-center gap-1.5">
                <button onclick="openFeeModal('${student.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1">
                    <i class="fa-solid fa-hand-holding-dollar"></i> ফি জমা
                </button>
                <button onclick="showStudentHistory('${student.id}')" class="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition" title="ইতিহাস"><i class="fa-solid fa-clock-rotate-left"></i></button>
                <button onclick="editStudent('${student.id}')" class="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition" title="এডিট"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteStudent('${student.id}')" class="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition" title="ডিলিট"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ==========================================
// ৭. ফি মডাল ও ছাত্র অপারেশন
// ==========================================
function openFeeModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        document.getElementById('feeStudentId').value = student.id;
        document.getElementById('feeStudentName').innerText = `${student.name} (রোল: #${student.roll})`;
        toggleFeeModal();
    }
}

async function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newName = prompt("ছাত্রের নতুন নাম:", student.name);
    const newRoll = prompt("নতুন রোল নম্বর:", student.roll);
    const newPhone = prompt("নতুন মোবাইল নম্বর:", student.phone);

    if (newName && newRoll) {
        try {
            await db.collection('students').doc(studentId).update({
                name: newName.trim(),
                roll: newRoll.trim(),
                phone: newPhone ? newPhone.trim() : student.phone
            });
            student.name = newName.trim();
            student.roll = newRoll.trim();
            if (newPhone) student.phone = newPhone.trim();
            renderStudents();
            alert('তথ্য ক্লাউডে আপডেট হয়েছে!');
        } catch (err) {
            alert('আপডেট করতে সমস্যা হয়েছে: ' + err.message);
        }
    }
}

async function deleteStudent(id) {
    if (confirm('আপনি কি নিশ্চিত যে এই ছাত্রকে বাদ দিতে চান?')) {
        try {
            await db.collection('students').doc(id).delete();
            students = students.filter(s => s.id !== id);
            renderStudents();
            alert('ছাত্র সফলভাবে মুছে ফেলা হয়েছে।');
        } catch (error) {
            alert('ডিলিট করতে সমস্যা হয়েছে: ' + error.message);
        }
    }
}

function showStudentHistory(studentId) {
    const student = students.find(s => s.id === studentId);
    const records = collections.filter(c => c.studentId === studentId);

    if (records.length === 0) {
        alert(`${student ? student.name : 'ছাত্র'}-এর কোনো জমার ইতিহাস নেই।`);
        return;
    }

    let text = `📜 ${student.name} (রোল: #${student.roll})-এর ফি জমা ইতিহাস:\n----------------------------------------\n`;
    records.forEach((r, i) => {
        text += `${i + 1}. মাস: ${r.month} | ₹${r.amount} | তারিখ: ${r.date} (রসিদ: ${r.recNo})\n`;
    });
    alert(text);
}

// ==========================================
// ৮. রসিদ, প্রিন্ট ও হোয়াটসঅ্যাপ
// ==========================================
function showReceipt(record) {
    currentReceiptNo = record.recNo;
    document.getElementById('recNo').innerText = record.recNo;
    document.getElementById('recName').innerText = record.name;
    document.getElementById('recRoll').innerText = '#' + record.roll;
    document.getElementById('recClass').innerText = record.class;
    document.getElementById('recMonth').innerText = record.month;
    document.getElementById('recAmount').innerText = formatINR(record.amount);
    document.getElementById('recDate').innerText = record.date;
    toggleReceiptModal();
}

function printReceipt() {
    window.print();
}

function sendWhatsAppReceipt(recNo = currentReceiptNo) {
    const record = collections.find(c => c.recNo === recNo);
    if (!record) return;

    const student = students.find(s => s.id === record.studentId);
    if (!student || !student.phone || student.phone === 'N/A') {
        alert('অভিভাবকের সঠিক নম্বর পাওয়া যায়নি!');
        return;
    }

    let phone = student.phone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const message = `আসসালামু আলাইকুম,\n*ডিংেল হাফিজিয়া মাদ্রাসা ফি প্রাপ্তি রসিদ*\n\nছাত্রের নাম: ${record.name}\nরোল: ${record.roll}\nশ্রেণী: ${record.class}\nমাস: ${record.month}\nজমার পরিমাণ: ₹${record.amount}\nরসিদ নং: ${record.recNo}\nতারিখ: ${record.date}\n\nধন্যবাদ, মাদ্রাসা কর্তৃপক্ষ।`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

// ==========================================
// ৯. CSV এক্সপোর্ট
// ==========================================
function exportStudentsToCSV() {
    if (students.length === 0) return alert("ডাউনলোড করার মতো তথ্য নেই!");
    let csv = "data:text/csv;charset=utf-8,\uFEFFRoll,Name,Class,Guardian,Phone,Type\n";
    students.forEach(s => csv += `"${s.roll}","${s.name}","${s.class}","${s.guardian}","${s.phone}","${s.type}"\n`);
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `Students_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
                    }
                                 
