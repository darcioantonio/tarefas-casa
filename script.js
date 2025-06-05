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
const controls = document.querySelector('.controls');
const reportDateInput = document.getElementById('report-date');

// Variável para armazenar o tipo de usuário
let currentUser = null;

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
    if (password === 'admin' || password === 'matheus') {
        currentUser = password;
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
            
            // Configurar interface baseada no tipo de usuário
            if (currentUser === 'admin') {
                // Admin vê apenas o relatório
                document.querySelectorAll('.task-section').forEach(section => {
                    section.style.display = 'none';
                });
                document.querySelector('.rules-section').style.display = 'none';
                controls.innerHTML = '<button onclick="showReport()">Ver Relatório</button>';
            } else {
                // Matheus vê apenas as tarefas
                reportSection.style.display = 'none';
                controls.innerHTML = '<button onclick="saveTasks()">Salvar Tarefas</button>';
            }
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

// Função para obter a hora atual formatada
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Função para salvar as tarefas
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task').forEach(taskElement => {
        const checkbox = taskElement.querySelector('input[type="checkbox"]');
        const label = taskElement.querySelector('label');
        const timeInput = taskElement.querySelector('.time-input');
        
        if (checkbox && label) {
            // Limpar o campo de hora se a tarefa for desmarcada
            if (!checkbox.checked) {
                if (timeInput) {
                    timeInput.value = ''; // Limpa o valor no input
                }
            } else if (checkbox.checked && !timeInput.value) {
                // Se a tarefa foi marcada agora e não tem hora, registrar a hora atual
                if (timeInput) {
                     timeInput.value = getCurrentTime();
                }
            }
            
            tasks.push({
                id: checkbox.id,
                name: label.textContent,
                completed: checkbox.checked,
                time: timeInput ? timeInput.value : null,
                lastUpdated: new Date().toISOString()
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
            tasks_count: tasks.length,
            user: currentUser
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
            // Iterar sobre as tarefas no HTML para garantir que todas sejam processadas
            document.querySelectorAll('.task').forEach(taskElement => {
                const checkbox = taskElement.querySelector('input[type="checkbox"]');
                const timeInput = taskElement.querySelector('.time-input');
                const taskId = checkbox ? checkbox.id : null;
                
                if (taskId) {
                    // Encontrar os dados correspondentes no que veio do Firebase
                    const savedTask = data.tasks.find(t => t.id === taskId);

                    if (checkbox) {
                        // Se houver dados salvos para esta tarefa
                        if (savedTask) {
                            checkbox.checked = savedTask.completed;
                        } else {
                             // Se não houver dados salvos, desmarcar por padrão
                            checkbox.checked = false;
                        }
                    }

                    if (timeInput) {
                         // Se houver dados salvos e a tarefa estiver marcada e tiver hora
                        if (savedTask && savedTask.completed && savedTask.time) {
                            timeInput.value = savedTask.time;
                            timeInput.readOnly = true; // Manter readOnly se tiver hora
                        } else {
                             // Caso contrário, limpar o campo de hora e garantir que não seja readOnly
                            timeInput.value = '';
                            timeInput.readOnly = true; // Ainda queremos que seja readOnly para Matheus, apenas limpamos o valor
                        }
                    }
                }
            });
        }
         // Se não houver documento para hoje, as tarefas ficarão desmarcadas e campos de hora vazios por padrão ao carregar o HTML
    })
    .catch((error) => {
        console.error("Erro ao carregar: ", error);
         // Em caso de erro, as tarefas também ficarão desmarcadas e campos de hora vazios
    });
}

// Função para mostrar o relatório
function showReport() {
    const selectedDate = reportDateInput.value;
    let targetDate = selectedDate || new Date().toISOString().split('T')[0];
    
    db.collection('tasks').doc(targetDate).get()
    .then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            let reportHTML = '<h3>Relatório do Dia</h3>';
            reportHTML += '<p>Data: ' + new Date(targetDate + 'T12:00:00').toLocaleDateString('pt-BR') + '</p>';
            reportHTML += '<ul>';
            
            data.tasks.forEach(task => {
                const status = task.completed ? '✅' : '❌';
                const time = task.time ? ` (${task.time})` : '';
                const lastUpdated = task.lastUpdated ? new Date(task.lastUpdated).toLocaleTimeString('pt-BR') : '';
                reportHTML += `<li>${status} ${task.name}${time} - Registrado às: ${lastUpdated}</li>`;
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
                date: targetDate,
                user: currentUser
            });
        } else {
            reportContent.innerHTML = '<p>Nenhum relatório encontrado para esta data.</p>';
             mainSection.style.opacity = '0';
            setTimeout(() => {
                mainSection.classList.add('hidden');
                reportSection.classList.remove('hidden');
                reportSection.style.opacity = '0';
                setTimeout(() => {
                    reportSection.style.opacity = '1';
                }, 100);
            }, 500);
        }
    })
    .catch((error) => {
        console.error("Erro ao carregar relatório: ", error);
        reportContent.innerHTML = '<p>Erro ao carregar o relatório.</p>';
         mainSection.style.opacity = '0';
            setTimeout(() => {
                mainSection.classList.add('hidden');
                reportSection.classList.remove('hidden');
                reportSection.style.opacity = '0';
                setTimeout(() => {
                    reportSection.style.opacity = '1';
                }, 100);
            }, 500);
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

// Adicionar evento para salvar automaticamente quando uma tarefa é marcada ou desmarcada
document.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') { // Salva apenas ao marcar/desmarcar checkbox
        const timeInput = e.target.parentElement.querySelector('.time-input');
        // A lógica de preencher a hora foi movida para saveTasks para lidar com desmarcar também
        saveTasks();
    }
    // Remover o evento para inputs de hora aqui
}); 