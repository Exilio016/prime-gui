const { app, Tray, Menu, dialog } = require('electron');
const { resolve } = require('path');
const { spawn } = require('child_process');


function prime_select(gpu){
  const prime = spawn('pkexec', ['prime-select', gpu]);
  prime.stdout.on('data', (data) =>{
    dialog.showMessageBox({type: 'info', title: 'Prime-GUI', message: data.toString() + 'Please log out, and log back, to apply the changes'});  
  });
}

function updateContextMenu(contextMenu, tray){
  const prime = spawn('prime-select', ['query']);
  prime.stdout.on('data', (data) => {
    str = data.toString();
    if (str === 'intel'){
      contextMenu.items[2].checked = false;
      contextMenu.items[3].checked = true;
    }
    else {
      contextMenu.items[2].checked = true;
      contextMenu.items[3].checked = false;
    }
    tray.setContextMenu(contextMenu);
  });
}

let tray = null;
app.on('ready', () => {

  tray = new Tray(resolve(__dirname, 'assets', 'tray_icon.png'));

  const contextMenu = Menu.buildFromTemplate([
    {label: 'Nvidia Settings', click: () => spawn('nvidia-settings') },
    {label: 'Nvidia', click: () => prime_select('nvidia'), type: 'radio'},
    {label: 'Intel', click: () => prime_select('intel'), type: 'radio'},
    {label: 'Quit', click: () => app.exit()}
  ]);
  contextMenu.addListener('menu-will-show', () => updateContextMenu(contextMenu, tray));

  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu);
  updateContextMenu(contextMenu, tray);
});