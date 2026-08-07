// ==========================================
// ১. গ্লোবাল ভ্যারিয়েবল ও কনফিগারেশন
// ==========================================
const MADRASA_PASSWORD = "123"; // ডিফল্ট পাসওয়ার্ড
let students = JSON.parse(localStorage.getItem('madrasa_students')) || [];
let collections = JSON.parse(localStorage.getItem('madrasa_collections')) || [];
let currentReceiptNo = null;

// ভারতীয় রূপি ফরম্যাট করার হেলপার ফাংশন
function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR', 
        maximumFractionDigits: 0 
    }).format(amount);
}

// ==========================================
// ২. লগইন ও নেভিগেশন
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
        renderStudents();
    } else {
        errorMessage.style.display = 'block';
    }
}

function handleLogout() {
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
}

// ==========================================
// ৩. মডাল হ্যান্ডলিং
// ==========================================
function toggleStudentModal() {
    document.getElementById('studentModal').classList.toggle('hidden');
}

function toggleFeeModal() {
    document.getElementById('feeModal').classList.toggle('hidden');
}

function toggleReceiptModal() {
    document.getElementById('receiptModal').classList.toggle('hidden');
}

// ==========================================
// ৪. ইভেন্ট লিসেনার ও ফর্ম সাবমিশন
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderStudents();

    // নতুন ছাত্র ভর্তি ফর্ম
    const addForm = document.getElementById('addStudentForm');
    if (addForm) {
        addForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const phoneInput = document.getElementById('guardianPhone').value.trim();
            const indianPhoneRegex = /^[6-9]\d{9}$/;

            if (phoneInput && !indianPhoneRegex.test(phoneInput)) {
                alert('অনুগ্রহ করে সঠিক ১০ সংখ্যার ভারতীয় মোবাইল নম্বর দিন।');
                return;
            }

            const newStudent = {
                id: Date.now(),
                name: document.getElementById('studentName').value.trim(),
                class: document.getElementById('studentClass').value.trim(),
                roll: document.getElementById('studentRoll').value.trim(),
                guardian: document.getElementById('guardianName').value.trim(),
                phone: phoneInput || 'N/A',
                type: document.getElementById('studentType').value
            };

            students.push(newStudent);
            localStorage.setItem('madrasa_students', JSON.stringify(students));
            this.reset();
            toggleStudentModal();
            renderStudents();
        });
    }

    // ফি জমা নেওয়ার ফর্ম
    const payForm = document.getElementById('payFeeForm');
    if (payForm) {
        payForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const studentId = parseInt(document.getElementById('feeStudentId').value);
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

            collections.push(record);
            localStorage.setItem('madrasa_collections', JSON.stringify(collections));
            toggleFeeModal();
            this.reset();
            renderStudents();
            showReceipt(record);
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
// ৫. রেন্ডারিং ও ডাটা ফিল্টারিং
// ==========================================
function renderStudents(searchQuery = '') {
    const tableBody = document.getElementById('studentTableBody');
    if (!tableBody) return;

    document.getElementById('totalStudents').innerText = students.length;

    const totalAmount = collections.reduce((sum, item) => sum + item.amount, 0);
    document.getElementById('totalCollection').innerText = formatINR(totalAmount);

    tableBody.innerHTML = '';
    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchQuery) ||
        s.roll.toString().includes(searchQuery) ||
        s.class.toLowerCase().includes(searchQuery)
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
                <button onclick="openFeeModal(${student.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1">
                    <i class="fa-solid fa-hand-holding-dollar"></i> ফি জমা
                </button>
                <button onclick="showStudentHistory(${student.id})" class="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition" title="ইতিহাস"><i class="fa-solid fa-clock-rotate-left"></i></button>
                <button onclick="editStudent(${student.id})" class="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition" title="এডিট"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteStudent(${student.id})" class="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition" title="ডিলিট"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ==========================================
// ৬. ছাত্র এডিট, ডিলিট ও হিস্ট্রি
// ==========================================
function openFeeModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        document.getElementById('feeStudentId').value = student.id;
        document.getElementById('feeStudentName').innerText = `${student.name} (রোল: #${student.roll})`;
        toggleFeeModal();
    }
}

function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newName = prompt("ছাত্রের নতুন নাম:", student.name);
    const newRoll = prompt("নতুন রোল নম্বর:", student.roll);
    const newPhone = prompt("নতুন মোবাইল নম্বর:", student.phone);

    if (newName && newRoll) {
        student.name = newName.trim();
        student.roll = newRoll.trim();
        if (newPhone) student.phone = newPhone.trim();
        localStorage.setItem('madrasa_students', JSON.stringify(students));
        renderStudents();
    }
}

function deleteStudent(id) {
    if (confirm('আপনি কি নিশ্চিত যে এই ছাত্রকে বাদ দিতে চান?')) {
        students = students.filter(s => s.id !== id);
        localStorage.setItem('madrasa_students', JSON.stringify(students));
        renderStudents();
    }
}

function showStudentHistory(studentId) {
    const student = students.find(s => s.id === studentId);
    const records = collections.filter(c => c.studentId === studentId);

    if (records.length === 0) {
        alert(`${student.name}-এর কোনো জমার ইতিহাস নেই।`);
        return;
    }

    let text = `📜 ${student.name} (রোল: #${student.roll})-এর ফি জমা ইতিহাস:\n----------------------------------------\n`;
    records.forEach((r, i) => {
        text += `${i + 1}. মাস: ${r.month} | ₹${r.amount} | তারিখ: ${r.date} (রসিদ: ${r.recNo})\n`;
    });
    alert(text);
}

// ==========================================
// ৭. রসিদ ও হোয়াটসঅ্যাপ/প্রিন্ট
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

    const message = `আসসালামু আলাইকুম,\n*মাদ্রাসা ফি প্রাপ্তি রসিদ*\n\nছাত্রের নাম: ${record.name}\nরোল: ${record.roll}\nশ্রেণী: ${record.class}\nমাস: ${record.month}\nজমার পরিমাণ: ₹${record.amount}\nরসিদ নং: ${record.recNo}\nতারিখ: ${record.date}\n\nধন্যবাদ, মাদ্রাসা কর্তৃপক্ষ।`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

// ==========================================
// ৮. ব্যাকআপ, রিস্টোর ও এক্সপোর্ট (CSV)
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

function exportCollectionsToCSV() {
    if (collections.length === 0) return alert("ডাউনলোড করার মতো কোনো রিপোর্ট নেই!");
    let csv = "data:text/csv;charset=utf-8,\uFEFFReceipt No,Student Name,Roll,Class,Month,Amount,Date\n";
    collections.forEach(c => csv += `"${c.recNo}","${c.name}","${c.roll}","${c.class}","${c.month}","${c.amount}","${c.date}"\n`);
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `Collection_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
}

function backupData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ students, collections }, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `Madrasa_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
}

function restoreData(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.students && data.collections) {
                if (confirm('আগের সব ডাটা বদলে ব্যাকআপ ফাইল লোড করতে চান?')) {
                    students = data.students;
                    collections = data.collections;
                    localStorage.setItem('madrasa_students', JSON.stringify(students));
                    localStorage.setItem('madrasa_collections', JSON.stringify(collections));
                    renderStudents();
                    alert('ডাটা সফলভাবে ব্যাকআপ থেকে লোড হয়েছে!');
                }
            }
        } catch (err) { alert('সঠিক ব্যাকআপ ফাইল নির্বাচন করুন!'); }
    };
    if (event.target.files.length > 0) reader.readAsText(event.target.files[0]);
}
                return;
            }

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
                // Indian Locale (bn-IN) সময় অনুযায়ী
                date: new Date().toLocaleDateString('bn-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            };

            collections.push(record);
            localStorage.setItem('madrasa_collections', JSON.stringify(collections));

            toggleFeeModal();
            payFeeForm.reset();
            renderStudents();

            // রসিদ প্রদর্শন
            showReceipt(record);
        });
    }

    // সার্চ ইনপুট (যদি HTML-এ #searchInput থাকে)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            renderStudents(query);
        });
    }
});

// ৫. রসিদ দেখানো ও ভারতীয় রুপিতে রেন্ডার করা
function showReceipt(record) {
    document.getElementById('recNo').innerText = record.recNo;
    document.getElementById('recName').innerText = record.name;
    document.getElementById('recRoll').innerText = record.roll;
    document.getElementById('recClass').innerText = record.class;
    document.getElementById('recMonth').innerText = record.month;
    document.getElementById('recAmount').innerText = formatINR(record.amount);
    document.getElementById('recDate').innerText = record.date;

    toggleReceiptModal();
}

// রসিদ প্রিন্ট করার অপশন
function printReceipt() {
    window.print();
}

// ৬. ফি দেওয়ার মডাল পপ-আপ
function openFeeModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        document.getElementById('feeStudentId').value = student.id;
        document.getElementById('feeStudentName').innerText = `${student.name} (রোল: #${student.roll})`;
        toggleFeeModal();
    }
}

// ৭. ছাত্র তালিকা ও মোট কালেকশন রেন্ডার
function renderStudents(searchQuery = '') {
    const tableBody = document.getElementById('studentTableBody');
    const totalStudentsElem = document.getElementById('totalStudents');
    const totalCollectionElem = document.getElementById('totalCollection');

    // মোট ছাত্র সংখ্যা
    if (totalStudentsElem) totalStudentsElem.innerText = students.length;

    // মোট কালেকশন (INR Format)
    const totalAmount = collections.reduce((sum, item) => sum + item.amount, 0);
    if (totalCollectionElem) totalCollectionElem.innerText = formatINR(totalAmount);

    if (!tableBody) return;
    tableBody.innerHTML = '';

    // সার্চ ফিল্টার লজিক
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchQuery) ||
        student.roll.toString().includes(searchQuery) ||
        student.class.toLowerCase().includes(searchQuery)
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
        let typeBadge = '';
        if (student.type === 'Orphan') {
            typeBadge = '<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">এতিম (ফ্রি)</span>';
        } else if (student.type === 'Poor') {
            typeBadge = '<span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">গরিব (ফ্রি)</span>';
        } else {
            typeBadge = '<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">সাধারণ</span>';
        }

        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 border-b border-slate-100 transition';
        row.innerHTML = `
            <td class="p-4 font-bold text-slate-700">#${student.roll}</td>
            <td class="p-4 font-semibold text-slate-800">${student.name}</td>
            <td class="p-4">${student.class}</td>
            <td class="p-4">
                <p class="font-medium text-slate-700">${student.guardian}</p>
                <p class="text-xs text-slate-400"><i class="fa-solid fa-phone mr-1"></i>+91 ${student.phone}</p>
            </td>
            <td class="p-4">${typeBadge}</td>
            <td class="p-4 text-center flex items-center justify-center gap-2">
                <button onclick="openFeeModal(${student.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1">
                    <i class="fa-solid fa-hand-holding-dollar"></i> ফি জমা
                </button>
                <button onclick="deleteStudent(${student.id})" class="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition" title="ডিলিট">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ৮. ছাত্র ডিলিট
function deleteStudent(id) {
    if (confirm('আপনি কি নিশ্চিত যে এই ছাত্রকে তালিকা থেকে মুছে ফেলতে চান?')) {
        students = students.filter(student => student.id !== id);
        localStorage.setItem('madrasa_students', JSON.stringify(students));
        renderStudents();
    }
                }
        // ==========================================
//  প্রফেশনাল এডিশনাল ফিচারসমূহ (নিচে পেস্ট করো)
// ==========================================

// ১. Excel / CSV ডাউনলোড ফাংশন (ছাত্র তালিকা)
function exportStudentsToCSV() {
    if (students.length === 0) {
        alert("ডাউনলোড করার মতো কোনো ছাত্র তালিকা নেই!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 for Bengali Text Support
    csvContent += "Roll,Name,Class,Guardian,Phone,Type\n";

    students.forEach(s => {
        csvContent += `"${s.roll}","${s.name}","${s.class}","${s.guardian}","${s.phone}","${s.type}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Madrasa_Students_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ২. কালেকশন রিপোর্ট Excel / CSV এ ডাউনলোড
function exportCollectionsToCSV() {
    if (collections.length === 0) {
        alert("ডাউনলোড করার মতো কোনো জমার রেকর্ড নেই!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Receipt No,Student Name,Roll,Class,Month,Amount,Date\n";

    collections.forEach(c => {
        csvContent += `"${c.recNo}","${c.name}","${c.roll}","${c.class}","${c.month}","${c.amount}","${c.date}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Madrasa_Collection_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ৩. ডাটা ব্যাকআপ (JSON ডাউনলোড)
function backupData() {
    const backupObj = {
        students: students,
        collections: collections,
        backupDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Madrasa_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// ৪. ডাটা রিস্টোর (JSON ফাইল আপলোড করে ডাটা ফেরত আনা)
function restoreData(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.students && data.collections) {
                if (confirm('আপনি কি ব্যাকআপ ডাটা আপলোড করতে চান? আগের সব ডাটা নতুন ডাটা দিয়ে রিপ্লেস হবে।')) {
                    students = data.students;
                    collections = data.collections;
                    localStorage.setItem('madrasa_students', JSON.stringify(students));
                    localStorage.setItem('madrasa_collections', JSON.stringify(collections));
                    renderStudents();
                    alert('ডাটা সফলভাবে রিস্টোর করা হয়েছে!');
                }
            } else {
                alert('ফাইলটি সঠিক ব্যাকআপ ফাইল নয়!');
            }
        } catch (err) {
            alert('ফাইল পড়তে সমস্যা হয়েছে!');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// ৫. মাসিক ফি কালেকশন সামারি রিপোর্ট
function getMonthlyReport() {
    const summary = {};
    collections.forEach(item => {
        if (!summary[item.month]) {
            summary[item.month] = 0;
        }
        summary[item.month] += item.amount;
    });
    return summary;
}
<!-- Excel export and Backup buttons -->
<div class="flex gap-2 my-4">
    <button onclick="exportStudentsToCSV()" class="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
        <i class="fa-solid fa-file-excel mr-1"></i> এক্সেল ডাউনলোড
    </button>
    <button onclick="backupData()" class="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm">
        <i class="fa-solid fa-download mr-1"></i> ব্যাকআপ সেভ করুন
    </button>
</div>
    // ==========================================
// MADRASA MANAGEMENT SYSTEM - COMPLETE SCRIPT
// ==========================================

// ১. পাসওয়ার্ড ও কনফিগারেশন
const MADRASA_PASSWORD = "123456";

// LocalStorage থেকে ডাটা লোড
let students = JSON.parse(localStorage.getItem('madrasa_students')) || [];
let collections = JSON.parse(localStorage.getItem('madrasa_collections')) || [];

// ভারতীয় রুপি (INR) ফরম্যাটিং ফাংশন
function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// ২. লগইন ও লগআউট
function handleLogin(event) {
    event.preventDefault();
    const inputPassword = document.getElementById('passwordInput').value;
    const errorMessage = document.getElementById('errorMessage');

    if (inputPassword === MADRASA_PASSWORD) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'flex';
        errorMessage.style.display = 'none';
        document.getElementById('passwordInput').value = '';
        renderStudents();
    } else {
        errorMessage.style.display = 'block';
    }
}

function handleLogout() {
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
}

// ৩. মডাল (Modal) টগল ফাংশনসমূহ
function toggleStudentModal() {
    const modal = document.getElementById('studentModal');
    if (modal) modal.classList.toggle('hidden');
}

function toggleFeeModal() {
    const modal = document.getElementById('feeModal');
    if (modal) modal.classList.toggle('hidden');
}

function toggleReceiptModal() {
    const modal = document.getElementById('receiptModal');
    if (modal) modal.classList.toggle('hidden');
}

// ৪. পেজ লোড ও ইভেন্ট লিসেনার
document.addEventListener('DOMContentLoaded', () => {

    renderStudents();

    // নতুন ছাত্র ভর্তি ফর্ম
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const phoneInput = document.getElementById('guardianPhone').value.trim();
            
            // ভারতীয় ১০-ডিজিট মোবাইল নম্বর যাচাই
            const indianPhoneRegex = /^[6-9]\d{9}$/;
            if (phoneInput && !indianPhoneRegex.test(phoneInput)) {
                alert('অনুগ্রহ করে সঠিক ১০ সংখ্যার ভারতীয় মোবাইল নম্বর দিন (যেমন: 9876543210)।');
                return;
            }

            const newStudent = {
                id: Date.now(),
                name: document.getElementById('studentName').value.trim(),
                class: document.getElementById('studentClass').value.trim(),
                roll: document.getElementById('studentRoll').value.trim(),
                guardian: document.getElementById('guardianName').value.trim(),
                phone: phoneInput || 'N/A',
                type: document.getElementById('studentType').value
            };

            students.push(newStudent);
            localStorage.setItem('madrasa_students', JSON.stringify(students));

            addStudentForm.reset();
            toggleStudentModal();
            renderStudents();
        });
    }

    // ফি জমার ফর্ম
    const payFeeForm = document.getElementById('payFeeForm');
    if (payFeeForm) {
        payFeeForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const studentId = parseInt(document.getElementById('feeStudentId').value);
            const student = students.find(s => s.id === studentId);

            if (!student) {
                alert('ছাত্রের তথ্য পাওয়া যায়নি!');
                return;
            }

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
                date: new Date().toLocaleDateString('bn-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            };

            collections.push(record);
            localStorage.setItem('madrasa_collections', JSON.stringify(collections));

            toggleFeeModal();
            payFeeForm.reset();
            renderStudents();

            // রসিদ প্রদর্শন
            showReceipt(record);
        });
    }

    // লাইভ সার্চ সিস্টেম
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            renderStudents(query);
        });
    }
});

// ৫. রসিদ দেখানো ও প্রিন্ট
let currentReceiptNo = null;

function showReceipt(record) {
    currentReceiptNo = record.recNo;
    document.getElementById('recNo').innerText = record.recNo;
    document.getElementById('recName').innerText = record.name;
    document.getElementById('recRoll').innerText = record.roll;
    document.getElementById('recClass').innerText = record.class;
    document.getElementById('recMonth').innerText = record.month;
    document.getElementById('recAmount').innerText = formatINR(record.amount);
    document.getElementById('recDate').innerText = record.date;

    toggleReceiptModal();
}

function printReceipt() {
    window.print();
}

// ৬. ফি দেওয়ার মডাল পপ-আপ
function openFeeModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        document.getElementById('feeStudentId').value = student.id;
        document.getElementById('feeStudentName').innerText = `${student.name} (রোল: #${student.roll})`;
        toggleFeeModal();
    }
}

// ৭. ছাত্র তালিকা ও ড্যাশবোর্ড রেন্ডার
function renderStudents(searchQuery = '') {
    const tableBody = document.getElementById('studentTableBody');
    const totalStudentsElem = document.getElementById('totalStudents');
    const totalCollectionElem = document.getElementById('totalCollection');

    if (totalStudentsElem) totalStudentsElem.innerText = students.length;

    const totalAmount = collections.reduce((sum, item) => sum + item.amount, 0);
    if (totalCollectionElem) totalCollectionElem.innerText = formatINR(totalAmount);

    if (!tableBody) return;
    tableBody.innerHTML = '';

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchQuery) ||
        student.roll.toString().includes(searchQuery) ||
        student.class.toLowerCase().includes(searchQuery)
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
        let typeBadge = '';
        if (student.type === 'Orphan') {
            typeBadge = '<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">এতিম (ফ্রি)</span>';
        } else if (student.type === 'Poor') {
            typeBadge = '<span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">গরিব (ফ্রি)</span>';
        } else {
            typeBadge = '<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">সাধারণ</span>';
        }

        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 border-b border-slate-100 transition';
        row.innerHTML = `
            <td class="p-4 font-bold text-slate-700">#${student.roll}</td>
            <td class="p-4 font-semibold text-slate-800">${student.name}</td>
            <td class="p-4">${student.class}</td>
            <td class="p-4">
                <p class="font-medium text-slate-700">${student.guardian}</p>
                <p class="text-xs text-slate-400"><i class="fa-solid fa-phone mr-1"></i>+91 ${student.phone}</p>
            </td>
            <td class="p-4">${typeBadge}</td>
            <td class="p-4 text-center flex items-center justify-center gap-2">
                <button onclick="openFeeModal(${student.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1" title="ফি জমা">
                    <i class="fa-solid fa-hand-holding-dollar"></i> ফি জমা
                </button>
                <button onclick="showStudentHistory(${student.id})" class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition" title="পেমেন্ট হিস্ট্রি">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                </button>
                <button onclick="editStudent(${student.id})" class="text-amber-600 hover:text-amber-800 p-2 rounded-lg hover:bg-amber-50 transition" title="এডিট">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deleteStudent(${student.id})" class="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition" title="ডিলিট">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ৮. ডাটা এডিট ও ডিলিট
function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newName = prompt("ছাত্রের নাম সংশোধন করুন:", student.name);
    const newRoll = prompt("রোল নম্বর সংশোধন করুন:", student.roll);
    const newPhone = prompt("অভিভাবকের মোবাইল নম্বর সংশোধন করুন:", student.phone);

    if (newName && newRoll) {
        student.name = newName.trim();
        student.roll = newRoll.trim();
        if (newPhone) student.phone = newPhone.trim();

        localStorage.setItem('madrasa_students', JSON.stringify(students));
        renderStudents();
        alert('তথ্য সফলভাবে আপডেট করা হয়েছে!');
    }
}

function deleteStudent(id) {
    if (confirm('আপনি কি নিশ্চিত যে এই ছাত্রকে তালিকা থেকে মুছে ফেলতে চান?')) {
        students = students.filter(student => student.id !== id);
        localStorage.setItem('madrasa_students', JSON.stringify(students));
        renderStudents();
    }
}

// ৯. হোয়াটসঅ্যাপে রসিদ নোটিফিকেশন
function sendWhatsAppReceipt(recNo = currentReceiptNo) {
    if (!recNo) {
        alert('রসিদ পাওয়া যায়নি!');
        return;
    }
    const record = collections.find(c => c.recNo === recNo);
    if (!record) return;

    const student = students.find(s => s.id === record.studentId);
    if (!student || !student.phone || student.phone === 'N/A') {
        alert('অভিভাবকের সঠিক মোবাইল নম্বর পাওয়া যায়নি!');
        return;
    }

    let phone = student.phone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const message = `আসসালামু আলাইকুম,\n*মাদ্রাসা ফি প্রাপ্তি রসিদ*\n\nছাত্রের নাম: ${record.name}\nরোল: ${record.roll}\nশ্রেণী: ${record.class}\nমাস: ${record.month}\nজমার পরিমাণ: ₹${record.amount}\nরসিদ নং: ${record.recNo}\nতারিখ: ${record.date}\n\nধন্যবাদ, মাদ্রাসা কর্তৃপক্ষ।`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// ১০. পেমেন্ট হিস্ট্রি ও বকেয়া হিসেব
function showStudentHistory(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const studentRecords = collections.filter(c => c.studentId === studentId);

    if (studentRecords.length === 0) {
        alert(`${student.name}-এর কোনো ফি জমা দেওয়ার ইতিহাস পাওয়া যায়নি।`);
        return;
    }

    let historyText = `📜 ${student.name} (রোল: #${student.roll})-এর ফি জমা ইতিহাস:\n----------------------------------------\n`;
    studentRecords.forEach((item, index) => {
        historyText += `${index + 1}. মাস: ${item.month} | পরিমাণ: ₹${item.amount} | তারিখ: ${item.date} (রসিদ: ${item.recNo})\n`;
    });

    alert(historyText);
}

// ১১. Excel/CSV এক্সপোর্ট এবং ব্যাকআপ ডাটা
function exportStudentsToCSV() {
    if (students.length === 0) {
        alert("ডাউনলোড করার মতো কোনো ছাত্র তালিকা নেই!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Roll,Name,Class,Guardian,Phone,Type\n";

    students.forEach(s => {
        csvContent += `"${s.roll}","${s.name}","${s.class}","${s.guardian}","${s.phone}","${s.type}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Madrasa_Students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function backupData() {
    const backupObj = {
        students: students,
        collections: collections,
        backupDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Madrasa_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function restoreData(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.students && data.collections) {
                if (confirm('আপনি কি ব্যাকআপ ডাটা আপলোড করতে চান? আগের সব ডাটা রিপ্লেস হবে।')) {
                    students = data.students;
                    collections = data.collections;
                    localStorage.setItem('madrasa_students', JSON.stringify(students));
                    localStorage.setItem('madrasa_collections', JSON.stringify(collections));
                    renderStudents();
                    alert('ডাটা সফলভাবে রিস্টোর করা হয়েছে!');
                }
            } else {
                alert('ফাইলটি সঠিক ব্যাকআপ ফাইল নয়!');
            }
        } catch (err) {
            alert('ফাইল পড়তে সমস্যা হয়েছে!');
        }
    };
    fileReader.readAsText(event.target.files[0]);
                          }
                    
