// Importar os scripts do Firebase
document.write(`
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics-compat.js"></script>
`);

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCWK2xPykUlr2f0EI99Jwd5mIMACYk_ULA",
    authDomain: "tarefas-casa-bffb3.firebaseapp.com",
    projectId: "tarefas-casa-bffb3",
    storageBucket: "tarefas-casa-bffb3.firebasestorage.app",
    messagingSenderId: "451284325896",
    appId: "1:451284325896:web:d6327a8ee5e5652b77a3bd",
    measurementId: "G-XX85QDC1SH"
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();
const db = firebase.firestore();

// Elementos da interface
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const reportSection = document.getElementById('report-section');
const reportContent = document.getElementById('report-content');
const passwordInput = document.getElementById('password');
const house = document.querySelector('.house');

// Animação da casinha
function animateHouse() {
    house.style.transform = 'scale(1.1)';
    setTimeout(() => {
        house.style.transform = 'scale(1)';
    }, 200);
}

// Adicionar animação ao clicar na casinha
house.addEventListener('click', animateHouse);

// Função de login com animação
function login() {
    const password = passwordInput.value;
    if (password === 'admin') {
        // Animação de transição
        loginSection.style.opacity = '0';
        setTimeout(() => {
            loginSection.classList.add('hidden');
            mainSection.classList.remove('hidden');
            mainSection.style.opacity = '0';
            setTimeout(() => {
                mainSection.style.opacity = '1';
            }, 100);
            loadTasks();
        }, 500);
    } else {
        // Animação de erro
        passwordInput.style.borderColor = '#d93025';
        passwordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passwordInput.style.borderColor = '#1a73e8';
            passwordInput.style.animation = '';
        }, 500);
        alert('Senha incorreta!');
    }
}

// Permitir login com Enter
passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        login();
    }
});

// Função para salvar as tarefas
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task').forEach(taskElement => {
        const checkbox = taskElement.querySelector('input[type="checkbox"]');
        const label = taskElement.querySelector('label');
        const timeInput = taskElement.querySelector('.time-input');
        
        if (checkbox && label) {
            tasks.push({
                id: checkbox.id,
                name: label.textContent,
                completed: checkbox.checked,
                time: timeInput ? timeInput.value : null
            });
        }
    });

    const today = new Date().toISOString().split('T')[0];
    
    db.collection('tasks').doc(today).set({
        tasks: tasks,
        lastUpdated: new Date()
    })
    .then(() => {
        showSaveAnimation();
        // Registrar evento no Analytics
        analytics.logEvent('tasks_saved', {
            date: today,
            tasks_count: tasks.length
        });
    })
    .catch((error) => {
        console.error("Erro ao salvar: ", error);
        alert('Erro ao salvar as tarefas!');
    });
}

// Animação de salvamento
function showSaveAnimation() {
    const saveButton = document.querySelector('button[onclick="saveTasks()"]');
    const originalText = saveButton.textContent;
    saveButton.textContent = '✅ Salvo!';
    saveButton.style.backgroundColor = '#34a853';
    
    setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.backgroundColor = '#1a73e8';
    }, 2000);
}

// Função para carregar as tarefas
function loadTasks() {
    const today = new Date().toISOString().split('T')[0];
    
    db.collection('tasks').doc(today).get()
    .then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            data.tasks.forEach(task => {
                const checkbox = document.getElementById(task.id);
                const timeInput = checkbox.parentElement.querySelector('.time-input');
                
                if (checkbox) {
                    checkbox.checked = task.completed;
                }
                if (timeInput && task.time) {
                    timeInput.value = task.time;
                }
            });
        }
    })
    .catch((error) => {
        console.error("Erro ao carregar: ", error);
    });
}

// Função para mostrar o relatório
function showReport() {
    const today = new Date().toISOString().split('T')[0];
    
    db.collection('tasks').doc(today).get()
    .then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            let reportHTML = '<h3>Relatório do Dia</h3>';
            reportHTML += '<p>Data: ' + new Date().toLocaleDateString() + '</p>';
            reportHTML += '<ul>';
            
            data.tasks.forEach(task => {
                const status = task.completed ? '✅' : '❌';
                const time = task.time ? ` (${task.time})` : '';
                reportHTML += `<li>${status} ${task.name}${time}</li>`;
            });
            
            reportHTML += '</ul>';
            reportContent.innerHTML = reportHTML;
            
            mainSection.style.opacity = '0';
            setTimeout(() => {
                mainSection.classList.add('hidden');
                reportSection.classList.remove('hidden');
                reportSection.style.opacity = '0';
                setTimeout(() => {
                    reportSection.style.opacity = '1';
                }, 100);
            }, 500);

            // Registrar evento no Analytics
            analytics.logEvent('report_viewed', {
                date: today
            });
        } else {
            alert('Nenhum relatório encontrado para hoje!');
        }
    })
    .catch((error) => {
        console.error("Erro ao carregar relatório: ", error);
        alert('Erro ao carregar o relatório!');
    });
}

// Função para voltar à tela principal
function backToMain() {
    reportSection.style.opacity = '0';
    setTimeout(() => {
        reportSection.classList.add('hidden');
        mainSection.classList.remove('hidden');
        mainSection.style.opacity = '0';
        setTimeout(() => {
            mainSection.style.opacity = '1';
        }, 100);
    }, 500);
}

// Adicionar evento para salvar automaticamente quando uma tarefa é marcada
document.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox' || e.target.classList.contains('time-input')) {
        saveTasks();
    }
}); 