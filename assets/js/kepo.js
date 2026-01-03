function sendMessage() {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var message = document.getElementById("message").value;
    var subject = document.getElementById("subject").value;
    var nomor = document.getElemetById("nomor").value;

    // Set the color to purple (you can use your preferred color code)
    var embedColor = 0x800080; 

    // Set the image URL (replace 'IMAGE_URL' with the actual URL of your image)
    var imageUrl = "https://pagecrawl.io/images/blog/discord.png"; 

    // Kirim data ke Discord webhook
    var discordWebhookURL = "https://discord.com/api/webhooks/1193072020364197958/0d-Zn3tVnD5P5KkhkM1JBtpABi0NvxntK2rY_bO4lQoGFNP1EMKR1G8nX4znqmgI6GCP";
    var jsonData = {
        embeds: [
            {
                color: embedColor,
                image: {
                    url: imageUrl
                },
                fields: [
                    {
                        name: "Name",
                        value: name,
                        inline: true
                    },
                    {
                        name: "Email",
                        value: email,
                        inline: true
                    },
                    {
                        name: "Subject",
                        value: subject,
                        inline: true
                    },
		    {
                        name: "Nomor HP",
                        value: nomor,
                        inline: true
                    },
                    {
                        name: "Message",
                        value: message
                    }
                ]
            }
        ]
    };

    fetch(discordWebhookURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        Swal.fire({
            icon: 'success',
            title: 'Pesan berhasil dikirim!',
            showConfirmButton: false,
            timer: 2000, // Adjust the time the alert stays visible (in milliseconds)
            customClass: {
                container: 'custom-swal-container',
                popup: 'custom-swal-popup',
                title: 'custom-swal-title',
                icon: 'custom-swal-icon',
            },
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Gagal untuk mengirimkan pesan.");
    });
}