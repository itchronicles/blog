document.addEventListener('DOMContentLoaded', () => {
  const codeBlocks = document.querySelectorAll('pre');
  
  codeBlocks.forEach(block => {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy';
    
    block.style.position = 'relative';
    block.appendChild(button);
    
    button.addEventListener('click', async () => {
      const code = block.querySelector('code').textContent;
      await navigator.clipboard.writeText(code);
      
      button.textContent = 'Copied!';
      button.classList.add('copied');
      
      setTimeout(() => {
        button.textContent = 'Copy';
        button.classList.remove('copied');
      }, 2000);
    });
  });
}); 