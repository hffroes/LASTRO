import { criarApp } from './app';

const PORTA = Number(process.env.PORT) || 3000;
const app = criarApp();

app.listen(PORTA, () => {
  console.log(`Servidor LASTRO ouvindo na porta ${PORTA}`);
});
