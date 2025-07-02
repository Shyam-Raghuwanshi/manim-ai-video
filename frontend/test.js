const apiKey = "sk-dcuzPU1Yo3XVtv_tGOWOE9Wu3ia-IxE5QxloHoqWgST3BlbkFJUmvWvv4qyxTIPy9QBVGl6bNVZaYgmrlMpNaCEKsIIA"
import Openai from 'openai';
const openaiClient = new Openai({ apiKey });
const res = await openaiClient.chat.completions.create({
      messages: [
      { role: 'user', content: 'Hello!' },
      ],
      model: 'gpt-3.5-turbo',
      }).then((response) => {
      console.log(response.choices[0].message.content);
      }).catch((error) => {
      console.error('Error:', error);
})

