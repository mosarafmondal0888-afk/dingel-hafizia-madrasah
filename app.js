// আপনার মাদ্রাসার লগইন পাসওয়ার্ড (এখানে ইচ্ছেমতো পরিবর্তন করতে পারেন)
const MADRASA_PASSWORD = "123456";

// ১. লগইন হ্যান্ডলার
function handleLogin(event) {
    event.preventDefault();
    const inputPassword = document.getElementById('passwordInput').value;
    const errorMessage = document.getElementById('errorMessage');

    if (inputPassword === MADRASA_PASSWORD) {
        // সঠিক পাসওয়ার্ড হলে
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboardScreen').classList.remove('hidden');
        errorMessage.classList.add('hidden');
        document.getElementById('passwordInput').value = '';
    } else {
        // ভুল পাসওয়ার্ড হলে
        errorMessage.classList.remove('hidden');
    }
}

// ২. লগআউট হ্যান্ডলার
function handleLogout() {
    document.getElementById('dashboardScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
}

// ৩. নতুন ছাত্র ভর্তির পপ-আপ ফর্ম দেখানো/লুকানো
function toggleStudentModal() {
    const modal = document.getElementById('studentModal');
    modal.classList.toggle('hidden');
}
