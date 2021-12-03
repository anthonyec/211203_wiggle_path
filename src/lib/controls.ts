export function createButton(label = '', onClick) {
  const button = document.createElement('button');

  button.innerHTML = label;
  button.addEventListener('click', onClick);

  document.body.appendChild(button);
};
