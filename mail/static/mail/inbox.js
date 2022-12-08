document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // This is to submit your email
  document.querySelector('#compose-submit').addEventListener("click", send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function send_email() {
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify ({
      recipients: document.querySelector('#compose-recipients').value,
      subject:  document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
  }); 

  setTimeout(function() {
    load_mailbox('sent');
  }, 100)

}


 function compose_email(sender, subject, opening_body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#contents-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = subject;
  document.querySelector("#compose-body").value = "\n\n\n\n\n" + "**************************************************************" + "\n" + opening_body;
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#contents-view').style.display = 'none';
  try {
    document.querySelector('#archive').remove();
    document.querySelector('#unarchive').remove();
    
  }
  catch(err) {
    console.log(err);
    
  }
  

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    //console.log(emails);

    let emails_view = document.querySelector('#emails-view');
    emails_view.style.position="relative";

    emails.forEach(element => {

      const email_div = document.createElement("div");

      email_div.addEventListener("click", () => {
        open_email(element.id, mailbox);
      });

      email_div.style.border = "2px solid black";
      email_div.style.marginBottom = "0.5px";
      email_div.setAttribute("id", "email_div")

      const email_from = document.createElement("div");
      email_from.setAttribute("id", "email_from");
      const subject_line = document.createElement("div");
      subject_line.setAttribute("id", "subject_line")
      const timestamp = document.createElement("div");
      timestamp.setAttribute("id", "timestamp")

      email_from.style.display = "inline-block";
      subject_line.style.display = "inline-block";
      timestamp.style.display = "inline-block";

      
      email_from.append(element["sender"]);
      subject_line.append(element["subject"]);
      timestamp.append(element["timestamp"]);

      email_div.append(email_from)
      email_div.append(subject_line)
      email_div.append(timestamp)

      emails_view.append(email_div)

      if (element["read"] == true) {
        email_div.style.backgroundColor = "lightgray";
      }
      else {
        email_div.style.backgroundColor = "white";
      }
    })
  }) 
} 

function open_email(id, mailbox) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#contents-view').style.display = 'block';

  document.querySelector('#from').textContent = '';
  document.querySelector('#to').textContent = '';
  document.querySelector('#subject').textContent = '';
  document.querySelector('#timestamp').textContent = '';

  document.querySelector('#Contents').textContent = '';

  try {
    document.querySelector("#reply").remove();
  }
  catch (err) {
    //console.log(err);
  }
  

  //This is to format the email

  fetch(`emails/${id}`)
    .then(response => response.json())
    .then(email => {

    document.querySelector('#from').textContent += email['sender'];
    document.querySelector('#to').textContent += email['recipients'];
    document.querySelector('#subject').textContent += email['subject'];
    document.querySelector('#timestamp').textContent += email['timestamp'];

    document.querySelector('#Contents').textContent += email['body']

    reply = document.createElement('button')
    reply.classList.add("btn", "btn-outline-info", "btn-sm", "mb-3")
    reply.innerHTML = "Reply";
    reply.setAttribute("id", "reply")
    header = document.querySelector('#header')

    header.append(reply);

    reply.addEventListener("click", () => {
      let subject = '';

      if (email['subject'].includes('Re:')) {
        subject = email['subject'];
      } else {
        subject = "Re: " + email['subject'];
      }

      let opening_body = "On " + email['timestamp'] + " " + email['sender'] + " " + "wrote:" + "\n" + "> " + email['body'] 

      compose_email(email['sender'], subject, opening_body);
    })

  });

  // This is to mark the email as read

  fetch(`emails/${id}`, {
    method: 'PUT', 
    body: JSON.stringify({
      read: true
    })
  })

  if (`${mailbox}` == 'inbox') {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      console.log("inbox runs");

      if (email['archived'] == false) {

        let archive2=document.createElement("button");
        archive2.classList.add("btn", "btn-outline-primary", "btn-sm", "mb-3");
        archive2.innerHTML = "Archive";
        archive2.setAttribute("id", "archive");

        let header = document.querySelector('#header');
        header.append(archive2);

        //document.querySelector('#archive').style.display = "block";
        try {
          document.querySelector('#unarchive').remove();
        }
        catch (err){
          //console.log(err);
        }
      
        document.querySelector('#archive').addEventListener("click", function archive() {
          
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true
            })
          })

          setTimeout(function() {
            load_mailbox("archive")
          }, 100);
          
        })
      }    
    })
  }

  if (`${mailbox}` == 'archive') {
      fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(email => { 
        let unarchive=document.createElement("button");
        console.log(unarchive);
        unarchive.classList.add("btn", "btn-outline-danger", "btn-sm", "mb-3");
        unarchive.innerHTML = "Unarchive";
        unarchive.setAttribute("id", "unarchive");

        let header = document.querySelector('#header');
        header.append(unarchive);

        try {
          document.querySelector('#archive').remove();
        }
        catch (err){
          console.log(err);
      }

      //document.querySelector('#unarchive').style.display = "block";
      document.querySelector('#unarchive').addEventListener("click", () => {

      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })

      setTimeout(function() {
        load_mailbox("inbox")
      }, 100);

      document.querySelector('#unarchive').remove();
      })

      });
      

    }
  }

  