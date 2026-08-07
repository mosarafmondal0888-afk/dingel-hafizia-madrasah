// পাসওয়ার্ড
const MADRASA_PASSWORD = "123456";

// মেমোরি থেকে ডাটা লোড
let students = JSON.parse(localStorage.getItem('madrasa_students')) || [];
let collections = JSON.parse(localStorage.getItem('madrasa_collections')) || [];

// ১. লগইন
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

// ২. লগআউট
function handleLogout() {
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
}

// Modals toggles
function toggleStudentModal() {
    document.getElementById('studentModal').classList.toggle('hidden');
}
function toggleFeeModal() {
    document.getElementById('feeModal').classList.toggle('hidden');
}
function toggleReceiptModal() {
    document.getElementById('receiptModal').classList.toggle('hidden');
}

// ৩. নতুন ছাত্র সাবমিট
document.addEventListener('DOMContentLoaded', () => {
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newStudent = {
                id: Date.now(),
                name: document.getElementById('studentName').value,
                class: document.getElementById('studentClass').value,
                roll: document.getElementById('studentRoll').value,
                guardian: document.getElementById('guardianName').value,
                phone: document.getElementById('guardianPhone').value,
                type: document.getElementById('studentType').value
            };

            students.push(newStudent);
            localStorage.setItem('madrasa_students', JSON.stringify(students));
            addStudentForm.reset();
            toggleStudentModal();
            renderStudents();
        });
    }

    // ৪. ফি জমা সাবমিট
    const payFeeForm = document.getElementById('payFeeForm');
    if (payFeeForm) {
        payFeeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const studentId = parseInt(document.getElementById('feeStudentId').value);
            const student = students.find(s => s.id === studentId);
            const amount = parseFloat(document.getElementById('feeAmount').value);
            const month = document.getElementById('feeMonth').value;

            const record = {
                recNo: 'REC-' + Math.floor(1000 + Math.random() * 9000),
                studentId: student.id,
                name: student.name,
                roll: student.roll,
                class: student.class,
                amount: amount,
                month: month,
                date: new Date().toLocaleDateString('bn-BD')
            };

            collections.push(record);
            localStorage.setItem('madrasa_collections', JSON.stringify(collections));

            toggleFeeModal();
            payFeeForm.reset();
            renderStudents();

            // টাকার রসিদ প্রস্তুত ও প্রদর্শন
            showReceipt(record);
        });
    }
});

// ৫. রসিদ দেখানোর লজিক
function showReceipt(record) {
    document.getElementById('recNo').innerText = record.recNo;
    document.getElementById('recName').innerText = record.name;
    document.getElementById('recRoll').innerText = record.roll;
    document.getElementById('recClass').innerText = record.class;
    document.getElementById('recMonth').innerText = record.month;
    document.getElementById('recAmount').innerText = '৳ ' + record.amount;
    document.getElementById('recDate').innerText = record.date;

    toggleReceiptModal();
}

// ৬. ফি দেয়ার পপ-আপ খোলা
function openFeeModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        document.getElementById('feeStudentId').value = student.id;
        document.getElementById('feeStudentName').innerText = `${student.name} (রোল: #${student.roll})`;
        toggleFeeModal();
    }
}

// ৭. টেবিল রেন্ডার
function renderStudents() {
    const tableBody = document.getElementById('studentTableBody');
    const totalStudentsElem = document.getElementById('totalStudents');
    const totalCollectionElem = document.getElementById('totalCollection');

    if (totalStudentsElem) totalStudentsElem.innerText = students.length;

    // মোট কালেকশন হিসাব
    const totalAmount = collections.reduce((sum, item) => sum + item.amount, 0);
    if (totalCollectionElem) totalCollectionElem.innerText = totalAmount;

    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-slate-400">
                    <i class="fa-solid fa-folder-open text-3xl mb-2 block"></i>
                    এখনো কোনো ছাত্র ভর্তি করা হয়নি।
                </td>
            </tr>
        `;
        return;
    }

    students.forEach((student) => {
        let typeBadge = student.type === 'Orphan' 
            ? '<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">এতিম (ফ্রি)</span>'
            : (student.type === 'Poor' 
                ? '<span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">গরিব (ফ্রি)</span>'
                : '<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">সাধারণ</span>');

        const row = `
            <tr class="hover:bg-slate-50 border-b border-slate-100 transition">
                <td class="p-4 font-bold text-slate-700">#${student.roll}</td>
                <td class="p-4 font-semibold text-slate-800">${student.name}</td>
                <td class="p-4">${student.class}</td>
                <td class="p-4">
                    <p class="font-medium text-slate-700">${student.guardian}</p>
                    <p class="text-xs text-slate-400"><i class="fa-solid fa-phone mr-1"></i>${student.phone}</p>
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
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// ৮. ডিলিট ছাত্র
function deleteStudent(id) {
    if (confirm('আপনি কি নিশ্চিত যে এই ছাত্রকে তালিকা থেকে মুছে ফেলতে চান?')) {
        students = students.filter(student => student.id !== id);
        localStorage.setItem('madrasa_students', JSON.stringify(students));
        renderStudents();
    }
}
