// Gera um sessionId único ao carregar a página
const sessionId = (function generateSessionId() {
    const uniqueInfo = Math.floor(Math.random() * (1000000 - 1000) + 1000);
    const timestamp = new Date().toISOString();
    return btoa(timestamp + uniqueInfo.toString());
  })();
  
  // Função para exibir o formulário e ocultar o vídeo e o botão inicial
  function showForm() {
    document.getElementById("ctaButton").style.display = "none";
    document.getElementById("video").style.display = "none";
    document.getElementById("formContainer").style.display = "block";
  }
  
  // Função para buscar horários disponíveis com base na data selecionada
  function fetchAvailableTimes() {
    const date = document.getElementById("date")?.value; // Campo de data
    const timeSelect = document.getElementById("time"); // Campo de hora
    const timeLabel = document.getElementById("timeLabel"); // Rótulo de hora
    const loadingMessage = document.getElementById("loadingMessage"); // Mensagem de carregamento
    const dateError = document.getElementById("dateError"); // Mensagem de erro
  
    if (!timeSelect || !timeLabel || !loadingMessage || !dateError) {
      console.error("Elementos necessários não foram encontrados no DOM.");
      return;
    }
  
    timeSelect.style.display = "none";
    timeSelect.disabled = true;
    timeLabel.style.display = "none";
    dateError.style.display = "none";
    dateError.textContent = "";
  
    loadingMessage.style.display = "flex";
  
    if (!date) {
      console.error("Nenhuma data foi selecionada.");
      loadingMessage.style.display = "none";
      return;
    }
  
    fetch("https://n8n.apto.vc/webhook/agendamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: date, sessionId: sessionId, type: "free_time" })
    })
      .then((response) => response.json())
      .then((data) => {
        loadingMessage.style.display = "none"; // Remove carregamento
  
        if (!data.output) {
          dateError.style.display = "block";
          dateError.textContent = "Erro ao processar os horários retornados.";
          return;
        }
  
        const times = data.output
          .split(",")
          .map((time) => time.trim())
          .filter((time) => isValidTime(time)); // Filtra horários válidos
  
        if (times.length > 0) {
          timeSelect.innerHTML = times
            .map((time) => `<option value="${time}">${time}</option>`)
            .join("");
          timeSelect.style.display = "block";
          timeSelect.disabled = false;
          timeLabel.style.display = "block";
        } else {
          dateError.style.display = "block";
          dateError.textContent = `${data.output}`;
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar os horários disponíveis:", error);
        loadingMessage.style.display = "none";
        dateError.style.display = "block";
        dateError.textContent = "Erro ao carregar os horários.";
      });
  }
  
  // Função para validar o formato de hora (HH:mm)
  function isValidTime(time) {
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timePattern.test(time); // Retorna true se corresponder ao padrão
  }
  
  // Função para adicionar novos campos de e-mail com botão de exclusão estilizado
  function addEmailField() {
    const emailList = document.getElementById("emailList");
  
    // Cria um container para o campo de e-mail e o botão
    const emailContainer = document.createElement("div");
    emailContainer.className = "email-container";
  
    // Campo de e-mail
    const newEmailField = document.createElement("input");
    newEmailField.type = "email";
    newEmailField.name = "email[]";
    newEmailField.placeholder = "E-mail adicional";
    newEmailField.required = true;
  
    // Botão de exclusão com estilo inline
    const removeButton = document.createElement("button");
    removeButton.textContent = "X";
    removeButton.type = "button";
  
    // Aplicação de estilo inline no botão
    removeButton.style.width = "5%"; // Largura de 5%
    removeButton.style.backgroundColor = "transparent"; // Fundo transparente
    removeButton.style.color = "#ff0000"; // Texto em vermelho
    removeButton.style.border = "1px solid #ff0000"; // Bordas vermelhas
    removeButton.style.borderRadius = "5px"; // Arredondado, igual aos campos
    removeButton.style.cursor = "pointer"; // Cursor de botão
    removeButton.style.height = "40px"; // Altura alinhada aos campos de e-mail
    removeButton.addEventListener("click", () => {
      emailList.removeChild(emailContainer); // Remove o container completo
    });
  
    // Adiciona o campo de e-mail e o botão ao container
    emailContainer.appendChild(newEmailField);
    emailContainer.appendChild(removeButton);
  
    // Adiciona o container à lista de e-mails
    emailList.appendChild(emailContainer);
  }
  
  // Função para abrir o modal de confirmação ou mensagens do Webhook
  function openModal(message, content = "", isConfirm = true) {
    const modal = document.getElementById("modal");
    const modalContent = document.querySelector(".modal-content");
    const modalMessage = document.getElementById("modalMessage");
  
    if (!modal || !modalMessage) {
      console.error("Modal ou mensagem não encontrada no DOM.");
      return;
    }
  
    modalMessage.textContent = message;
  
    // Remove elementos anteriores para resetar o modal
    modalContent.innerHTML = `<p id="modalMessage">${message}</p>`;
  
    // Adiciona conteúdo extra, se fornecido
    if (content) {
      const extraContent = document.createElement("div");
      extraContent.innerHTML = content;
      extraContent.style.textAlign = "left"; // Alinha o conteúdo à esquerda
      extraContent.style.marginLeft = "20px"; // Ajusta o espaço da lateral esquerda
      extraContent.style.marginRight = "20px"; // Adiciona margem na lateral direita
      modalContent.appendChild(extraContent);
    }
  
    // Cria botão de cancelamento (lado esquerdo)
    const cancelButton = document.createElement("button");
    cancelButton.textContent = isConfirm ? "Cancelar" : "Fechar";
    cancelButton.className = "cancel-button";
    cancelButton.addEventListener("click", function () {
      modal.style.display = "none"; // Fecha o modal
    });
  
    // Cria botão de confirmação (lado direito, apenas para confirmação)
    if (isConfirm) {
      const confirmButton = document.createElement("button");
      confirmButton.textContent = "Confirmar";
      confirmButton.className = "confirm-button";
      confirmButton.addEventListener("click", function () {
        modal.style.display = "none";
        sendData(); // Envia os dados ao Webhook
      });
      modalContent.appendChild(confirmButton);
    }
  
    modalContent.appendChild(cancelButton);
  
    modal.style.display = "flex"; // Exibe o modal
  }
  
  // Evento para capturar o envio do formulário
  document
    .getElementById("scheduleForm")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Evita o envio padrão do formulário
      openModal("Deseja confirmar o agendamento com os dados informados?");
    });
  
  function sendData() {
    const formData = new FormData(document.getElementById("scheduleForm"));
    const data = {
      name: formData.get("name"),
      company: formData.get("company"),
      date: formData.get("date"),
      time: formData.get("time"),
      email: formData.getAll("email[]"),
      sessionId: sessionId,
      type: "to_schedule"
    };
  
    fetch("https://n8n.apto.vc/webhook/agendamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.output === "SUCESSO") {
          // Oculta o formulário
          document.getElementById("formContainer").style.display = "none";
  
          // Exibe a mensagem de sucesso
          const successMessage = document.getElementById("successMessage");
          const successText = document.getElementById("successText");
  
          successText.innerHTML = `
            <strong>Título:</strong> Apto e ${data.company}<br>
            <strong>Data/ Hora:</strong> ${data.date} ${data.time}<br>
            <strong>Participantes:</strong> ${data.email.join(", ")}<br><br>
            Agendamento realizado com sucesso!<br>
            Aguardamos ansiosamente pelo encontro. 💙
          `;
  
          successMessage.style.display = "block";
        } else {
          alert(
            "Ocorreu uma falha ao tentar fazer o agendamento, tente novamente em alguns minutos."
          );
        }
      })
      .catch((error) => {
        alert("Erro ao processar o agendamento, tente novamente.");
        console.error("Erro:", error);
      });
  }
  