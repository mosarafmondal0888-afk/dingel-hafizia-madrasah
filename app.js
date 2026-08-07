// আপনার পাসওয়ার্ড
const MADRASA_PASSWORD = "123456";

// ছাত্রদের ডাটা লোকাল মেমোরি থেকে লোড করা (যদি থাকে)
let students = JSON.parse(localStorage.getItem('madrasa_students')) || [];

// ১. লগইন করার ফাংশন
function handleLogin(event) {
    event.preventDefault();
    const inputPassword = document.getElementById('passwordInput').value;
    const errorMessage = document.getElementById('errorMessage');

    if (inputPassword === MADRASA_PASSWORD) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'flex';
        errorMessage.style.display = 'none';
        document.getElementById('passwordInput').value = '';
        
        // লগইন সফল হলে স্টুডেন্ট লিস্ট দেখাবে
        renderStudents();
    } else {
        errorMessage.style.display = 'block';
    }
}

// ২. লগআউট করার ফাংশন
function handleLogout() {
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
}

// ৩. নতুন ছাত্র ভর্তির পপ-আপ ফর্ম খোলা বা বন্ধ করা
function toggleStudentModal() {
    const modal = document.getElementById('studentModal');
    if (modal) {
        modal.classList.toggle('hidden');
    }
}

// ৪. পেজ লোড হওয়ার পর ফর্ম সাবমিট হ্যান্ডলার
document.addEventListener('DOMContentLoaded', () => {
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // নতুন ছাত্রের তথ্য সংগ্রহ
            const newStudent = {
                id: Date.now(),
                name: document.getElementById('studentName').value,
                class: document.getElementById('studentClass').value,
                roll: document.getElementById('studentRoll').value,
                guardian: document.getElementById('guardianName').value,
                phone: document.getElementById('guardianPhone').value,
                type: document.getElementById('studentType').value
            };

            // ডাটা অ্যারেতে যোগ করা ও মেমোরিতে সেভ করা
            students.push(newStudent);
            localStorage.setItem('madrasa_students', JSON.stringify(students));

            // ফর্ম রিসেট ও পপ-আপ বন্ধ করা
            addStudentForm.reset();
            toggleStudentModal();

            // টেবিলে নতুন ডাটা দেখানো
            renderStudents();
        });
    }
});

// ৫. টেবিলে ছাত্রদের লিস্ট দেখানো
function renderStudents() {
    const tableBody = document.getElementById('studentTableBody');
    const totalStudentsElem = document.getElementById('totalStudents');
    
    if (!tableBody) return;

    // সংখ্যা আপডেট
    if (totalStudentsElem) {
        totalStudentsElem.innerText = students.length;
    }

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
        let typeBadge = '';
        if (student.type === 'Orphan') {
            typeBadge = '<span class="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-semibold">এতিম (ফ্রি)</span>';
        } else if (student.type === 'Poor') {
            typeBadge = '<span class="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">গরিব (ফ্রি)</span>';
        } else {
            typeBadge = '<span class="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">সাধারণ</span>';
        }

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
                <td class="p-4 text-center">
                    <button onclick="deleteStudent(${student.id})" class="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition" title="ডিলিট করুন">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// ৬. ছাত্র ডিলিট করার ফাংশন
function deleteStudent(id) {
    if (confirm('আপনি কি নিশ্চিত যে এই ছাত্রকে তালিকা থেকে মুছে ফেলতে চান?')) {
        students = students.filter(student => student.id !== id);
        localStorage.setItem('madrasa_students', JSON.stringify(students));
        renderStudents();
    }
        }
