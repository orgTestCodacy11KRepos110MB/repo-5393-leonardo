/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import * as Leo from '@adobe/leonardo-contrast-colors';
import {getColorClassByName} from './getThemeData';
import {
  addKeyColor,
  addKeyColorInput,
  clearAllColors
} from './keyColors';
import {addBulk} from './addBulkDialog'
import {throttle} from './utils';
import {
  toggleControls,
  themeUpdateParams
} from './themeUpdate';
import {
  updateRamps,
  themeRamp,
  themeRampKeyColors
} from './ramps';
import {createInterpolationCharts} from './createInterpolationCharts';
import {createRGBchannelChart} from './createRGBchannelChart';
import {baseScaleOptions} from './createBaseScaleOptions';
import {openDetailTab} from './tabs';
import {themeDeleteItem} from './colorScale';
import {_theme} from './initialTheme';

function showColorDetails(e) {
  let element = e.target.id;

  let button = document.getElementById(element);
  const id = element.replace('-toggleConfig', '');
  let triggeredColorNameInputId = id.concat('_colorName');
  let triggeredColorNameInput = document.getElementById(triggeredColorNameInputId);
  let triggeredColorName = triggeredColorNameInput.value;

  let colorData = getColorClassByName(triggeredColorName);
  console.log(colorData)

  // Clear main container
  let contentArea = document.getElementById('colorDetails');
  // contentArea.innerHTML = ' ';
  contentArea.style.display = 'flex';
  // Clear config panel, just to be safe
  let configPanel = document.getElementById('colorConfigPanel');
  configPanel.innerHTML = ' ';
  configPanel.style.display = 'flex';

  let configPanelItem = document.createElement('div');
  configPanelItem.className = 'spectrum-Panel-Item';

  // create unique ID for color object
  let thisId = id;
  // generate color input objects:
  // gradient, inputs, etc.
  let wrapper = contentArea;

  // Create back button
  let panelHeader = document.createElement('div');
  panelHeader.className = 'spectrum-Panel-Item';
  let backButton = document.createElement('button');
  backButton.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  backButton.title = 'Back to all colors'
  backButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-ChevronLeft" />
  </svg>
  `;
  backButton.onclick = () => {
    contentArea.innerHTML = ' ';
    contentArea.style.display = 'none';
    configPanel.innerHTML = ' ';
    configPanel.style.display = 'none';
    themeUpdateParams()
  }
  let backLabel = document.createElement('span')
  backLabel.className = 'spectrum-Heading spectrum-Heading--sizeXS panelBackButtonLabel';
  backLabel.innerHTML = 'Back to all colors';

  panelHeader.appendChild(backButton);
  panelHeader.appendChild(backLabel);

  // Create gradient
  let gradient = document.createElement('div');
  gradient.className = 'themeColor_gradient';
  let gradientId = thisId.concat('_gradient');
  gradient.id = gradientId;

  // Create first panel item
  let panelColorName = document.createElement('div');
  panelColorName.className = 'spectrum-Panel-Item';

  // Create form container
  let inputs = document.createElement('div');
  inputs.className = `spectrum-Form spectrum-Form--row themeColor_configs`;
  inputs.id = `${thisId}-themeColor_configs`

  let interpInputs = document.createElement('div');
  interpInputs.className = `spectrum-Form spectrum-Form--row`;
  interpInputs.id = `${thisId}-themeColor_keyColors`

  // Field label
  let colorNameLabel = document.createElement('label');
  colorNameLabel.className = 'spectrum-Fieldlabel spectrum-Fieldlabel--sizeM';
  colorNameLabel.innerHTML = 'Color name'
  // Color Name Input
  let colorName = document.createElement('div');
  colorName.className = 'spectrum-Form-item';
  let colorNameInput = document.createElement('input');
  let colorNameWrapper = document.createElement('div');
  colorNameWrapper.className = 'spectrum-Textfield spectrum-Textfield--sizeM';
  colorNameInput.type = 'text';
  colorNameInput.className = 'spectrum-Textfield-input colorNameInput';
  colorNameInput.id = thisId.concat('_colorName2');
  colorNameInput.name = thisId.concat('_colorName2');
  colorNameInput.value = colorData.name;
  let originalName = colorData.name;
  // colorNameInput.oninput = throttle(themeUpdateParams, 10);
  colorNameInput.onchange = (e) => {
    let paletteNameInput = document.getElementById(thisId.concat('_colorName'));
    const newName = `${e.target.value}`;
    paletteNameInput.value = newName;
    _theme.updateColor = {color: originalName, name: newName}

    baseScaleOptions();

    originalName = newName;
  };

  // colorNameLabel.innerHTML = 'Color scale name';
  // colorName.appendChild(colorNameLabel);
  colorNameWrapper.appendChild(colorNameInput);
  colorName.appendChild(colorNameLabel);
  colorName.appendChild(colorNameWrapper);

  // Create second panel item
  let panelKeyColors = document.createElement('div');
  panelKeyColors.className = 'spectrum-Panel-Item';
  
  // Key Color Input
  let keyColors = document.createElement('div');
  keyColors.className = 'themeColor_subheading';
  let keyColorsLabel = document.createElement('h4');
  keyColorsLabel.className = 'spectrum-Heading6';
  keyColorsLabel.for = thisId.concat('_keyColors');

  let keyColorsInput = document.createElement('div');
  keyColorsInput.className = 'keyColorsWrapper';
  let keyColorsId = thisId.concat('_keyColors');
  keyColorsInput.id = keyColorsId;
  keyColorsLabel.innerHTML = 'Key colors';
  keyColors.appendChild(keyColorsLabel);

  // Key Colors Actions
  let addColors = document.createElement('div');
  addColors.className = 'keyColorActions';
  let addButton = document.createElement('button');
  addButton.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  let buttonId = thisId.concat('_addKeyColor');
  addButton.id = buttonId;
  addButton.title = "Add key color"
  addButton.addEventListener('click', addKeyColor);
  addButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-Add" />
  </svg>
  `;
  let bulkButton = document.createElement('button');
  bulkButton.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  let bulkId = thisId.concat('_addBulk');
  bulkButton.title = "Add bulk key colors"
  bulkButton.id = bulkId;
  bulkButton.addEventListener('click', addBulk);
  bulkButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-BoxAdd" />
  </svg>
  `;
  let clearKeyColorsButton = document.createElement('button');
  clearKeyColorsButton.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  let clearColorsId = thisId.concat('_clearAllColors');
  clearKeyColorsButton.title = "Clear all key colors"
  clearKeyColorsButton.id = clearColorsId;
  clearKeyColorsButton.addEventListener('click', clearAllColors);
  clearKeyColorsButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-CloseCircle" />
  </svg>
  `;

  addColors.appendChild(clearKeyColorsButton);

  addColors.appendChild(addButton);
  addColors.appendChild(bulkButton);
  keyColors.appendChild(addColors);

  // Create third panel item
  let panelInterpolationMode = document.createElement('div');
  panelInterpolationMode.className = 'spectrum-Panel-Item';
  
  // Interpolation mode
  let interp = document.createElement('div');
  interp.className = 'spectrum-Form-item spectrum-Form-item--row';
  let interpLabel = document.createElement('label');
  interpLabel.className = 'spectrum-FieldLabel spectrum-Fieldlabel--sizeM spectrum-FieldLabel--left';
  interpLabel.for = thisId.concat('_mode');
  let interpLabelText = 'Color space';
  // let interpDropdown = document.createElement('div');
  // interpDropdown.className = 'spectrum-Picker spectrum-Picker--sizeM';
  // interpDropdown.id = thisId.concat('_modeDropdown');
  let interpSelect = document.createElement('select');
  interpSelect.className = 'spectrum-Picker spectrum-Picker--sizeM pickerMode';
  interpSelect.id = thisId.concat('_mode');
  interpSelect.name = thisId.concat('_mode');
  interpSelect.oninput = throttle(themeUpdateParams, 20);
  interpSelect.addEventListener('change', (e) => {
    _theme.updateColor = {color: colorData.name, colorspace: e.target.value}
    updateRamps(colorData, thisId)
  })

  let interpDropdownIcon = document.createElement('span');
  interpDropdownIcon.className = 'spectrum-Picker-iconWrapper';
  interpDropdownIcon.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Picker-icon spectrum-UIIcon-ChevronDownMedium spectrum-Picker-icon">
    <use xlink:href="#spectrum-css-icon-ChevronDownMedium"></use>
  </svg>`;

  interpLabel.innerHTML = interpLabelText;
  // interpDropdown.appendChild(interpSelect);
  interpSelect.appendChild(interpDropdownIcon);
  interp.appendChild(interpLabel);
  interp.appendChild(interpSelect);

  // Interpolation options
  interpSelect.options.length = 0;

  let opts = {
    'CAM02': 'Jab',
    'CAM02p': 'JCh',
    'LCH': 'Lch',
    'LAB': 'Lab',
    'HSL': 'HSL',
    'HSLuv': 'HSLuv',
    'HSV': 'HSV',
    'RGB': 'RGB'
  };

  for(let index in opts) { interpSelect.options[interpSelect.options.length] = new Option(opts[index], index); }
  interpSelect.value = colorData.colorspace;

  // Smoothing
  let smoothFormItem = document.createElement('div');
  smoothFormItem.className = 'spectrum-Form-item';
  let smoothWrapper = document.createElement('div');
  smoothWrapper.className = 'spectrum-Switch';
  let smoothInput = document.createElement('input');
  smoothInput.type = 'checkbox';
  smoothInput.className = 'spectrum-Switch-input';
  smoothInput.id = thisId.concat('_smooth');
  smoothInput.oninput = throttle(themeUpdateParams, 20);
  smoothInput.addEventListener('input', (e) => {
    let checked = e.target.checked;
    const boolean = checked.toString();
    _theme.updateColor = {color: colorData.name, smooth: boolean}
    updateRamps(colorData, thisId)
  })
  let smoothSwitch = document.createElement('span');
  smoothSwitch.className = 'spectrum-Switch-switch';
  let smoothLabel = document.createElement('label');
  smoothLabel.className = 'spectrum-Switch-label';
  smoothLabel.htmlFor = thisId.concat('_smooth');
  smoothLabel.innerHTML = 'Smooth';
  smoothWrapper.appendChild(smoothInput);
  smoothWrapper.appendChild(smoothSwitch);
  smoothWrapper.appendChild(smoothLabel);
  smoothFormItem.appendChild(smoothWrapper);

  // Actions
  let actions = document.createElement('div');
  actions.className = 'spectrum-ButtonGroup';
  let deleteColor = document.createElement('button');
  deleteColor.className = 'spectrum-Button spectrum-Button--sizeM spectrum-Button--warning';
  deleteColor.title = 'Delete color scale'
  deleteColor.id = thisId.concat('_delete');
  deleteColor.innerHTML = 'Delete color scale'
  let deletePanel = document.createElement('div');
  deletePanel.className = 'spectrum-Panel-Item';
  // deleteColor.innerHTML = `
  // <!-- <span class="spectrum-ActionButton-label">Add Color</span> -->
  // <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
  //   <use xlink:href="#spectrum-icon-18-Delete" />
  // </svg>`;
  deletePanel.appendChild(deleteColor);

  colorName.appendChild(actions);

  // Title
  let title = document.createElement('h2');
  title.className = 'spectrum-Typography spectrum-Heading spectrum-Heading--sizeXS'
  title.innerHTML = 'Color scale'

  // Tabs
  let tabs = document.createElement('div');
  tabs.className = 'spectrum-Tabs spectrum-Tabs--horizontal spectrum-Tabs--quiet';
  let tabItem1 = document.createElement('div');
  tabItem1.className = 'spectrum-Tabs-item detail-Tabs-item';
  tabItem1.id = 'tabInterpCharts';
  let tabItem1Label = document.createElement('label');
  tabItem1Label.className = 'spectrum-Tabs-itemLabel';
  tabItem1Label.innerHTML = 'Charts';

  let tabItem2 = document.createElement('div');
  tabItem2.className = 'spectrum-Tabs-item detail-Tabs-item';
  tabItem2.id = 'tabRGBChannels';
  let tabItem2Label = document.createElement('label');
  tabItem2Label.className = 'spectrum-Tabs-itemLabel';
  tabItem2Label.innerHTML = 'RGB Channels';

  let tabItem3 = document.createElement('div');
  tabItem3.className = 'spectrum-Tabs-item detail-Tabs-item';
  tabItem3.id = 'tabModel';
  let tabItem3Label = document.createElement('label');
  tabItem3Label.className = 'spectrum-Tabs-itemLabel';
  tabItem3Label.innerHTML = '3d model';

  let tabContent1 = document.createElement('div');
  tabContent1.id = 'tabInterpChartsContent';
  tabContent1.className = 'tabDetailContent';

  let tabContent2 = document.createElement('div');
  tabContent2.id = 'tabRGBChannelsContent';
  tabContent2.className = 'tabDetailContent';

  let tabContent3 = document.createElement('div');
  tabContent3.id = 'tabModelContent';
  tabContent3.className = 'tabDetailContent';

  // Chart colorspace preview picker
  let chartsMode = document.createElement('div');
  chartsMode.className = 'spectrum-Form-item spectrum-Form-item--row';
  let chartsModeLabel = document.createElement('label');
  chartsModeLabel.className = 'spectrum-FieldLabel spectrum-Fieldlabel--sizeM spectrum-FieldLabel--left';
  chartsModeLabel.for = 'chartsMode';
  let chartsModeLabelText = 'Charts mode';
  let chartsModeSelect = document.createElement('select');
  chartsModeSelect.className = 'spectrum-Picker spectrum-Picker--sizeM pickerMode';
  chartsModeSelect.id = 'chartsMode';
  chartsModeSelect.name = 'chartsMode';
  // chartsModeSelect.oninput = throttle(themeUpdateParams, 20);


  let chartsModeDropdownIcon = document.createElement('span');
  chartsModeDropdownIcon.className = 'spectrum-Picker-iconWrapper';
  chartsModeDropdownIcon.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Picker-icon spectrum-UIIcon-ChevronDownMedium spectrum-Picker-icon">
    <use xlink:href="#spectrum-css-icon-ChevronDownMedium"></use>
  </svg>`;

  chartsModeLabel.innerHTML = chartsModeLabelText;
  // chartsModeDropdown.appendChild(chartsModeSelect);
  chartsModeSelect.appendChild(chartsModeDropdownIcon);
  chartsMode.appendChild(chartsModeLabel);
  chartsMode.appendChild(chartsModeSelect);

  // Interpolation options
  chartsModeSelect.options.length = 0;

  for(let index in opts) { chartsModeSelect.options[chartsModeSelect.options.length] = new Option(opts[index], index); }
  chartsModeSelect.value = 'CAM02';


  // Put the tabs together
  tabItem1.appendChild(tabItem1Label);
  tabItem2.appendChild(tabItem2Label);
  tabItem3.appendChild(tabItem3Label);
  tabs.appendChild(tabItem1);
  tabs.appendChild(tabItem2);
  tabs.appendChild(tabItem3);
  tabs.appendChild(chartsMode);

  // Put it all together
  inputs.appendChild(keyColors);
  inputs.appendChild(keyColorsInput);
  
  interpInputs.appendChild(interp);
  interpInputs.appendChild(smoothFormItem);

  configPanelItem.appendChild(colorName);
  panelKeyColors.appendChild(inputs);
  panelInterpolationMode.appendChild(interpInputs);

  configPanel.appendChild(panelHeader);
  configPanel.appendChild(configPanelItem);
  configPanel.appendChild(panelKeyColors);
  configPanel.appendChild(panelInterpolationMode);
  configPanel.appendChild(deletePanel);

  // Content area needs to be appended with items
  wrapper.appendChild(title);
  wrapper.appendChild(gradient);
  // Create divs for charts
  let chart1 = document.createElement('div');
  chart1.id = 'interpolationChart';
  let chart2 = document.createElement('div');
  chart2.id = 'interpolationChart2';
  let chart3 = document.createElement('div');
  chart3.id = 'RGBchart';

  tabContent1.appendChild(chart1);
  tabContent1.appendChild(chart2);
  tabContent2.appendChild(chart3);

  wrapper.appendChild(tabs)
  wrapper.appendChild(tabContent1);
  wrapper.appendChild(tabContent2);
  wrapper.appendChild(tabContent3);

  // Then run functions on the basic placeholder inputs
  let colorKeys = colorData.colorKeys;
  for (let i = 0; i < colorKeys.length; i++) {
    addKeyColorInput(colorKeys[i], buttonId, colorData.name, i);
  }

  let rampData = Leo.createScale({swatches: 30, colorKeys: colorKeys, colorspace: colorData.colorspace, smooth: colorData.smooth});

  let colors = rampData;

  chartsModeSelect.addEventListener('change', (e) => {
    const thisColorId = id;
    let colorData = getColorClassById(thisColorId);
    let colors = Leo.createScale({swatches: 30, colorKeys: colorData.colorKeys, colorspace: colorData.colorspace, smooth: colorData.smooth});
    createInterpolationCharts(colors, e.target.value)
  })
  
  themeRamp(colors, gradientId);
  themeRampKeyColors(colorKeys, gradientId);
  createRGBchannelChart(colors);
  createInterpolationCharts(colors, 'CAM02')
  // charts.createAllCharts(colorData.colorspace, colors);
  
  toggleControls();

  document.getElementById(thisId.concat('_colorName')).addEventListener('input', function(e) {

  });
  // document.getElementById(thisId.concat('_delete')).addEventListener('click', themeDeleteItem);
  // document.getElementById('tabChartContent').click();
  document.getElementById('tabInterpCharts').addEventListener('click', (e) => {openDetailTab(e, 'tabInterpChartsContent')});
  document.getElementById('tabRGBChannels').addEventListener('click', (e) => {openDetailTab(e, 'tabRGBChannelsContent')});
  document.getElementById('tabModel').addEventListener('click', (e) => {openDetailTab(e, 'tabModelContent', colors)});
  document.getElementById('tabInterpCharts').click();

  deleteColor.addEventListener('click', themeDeleteItem);
  deleteColor.addEventListener('click', function(){ 
    const thisColorId = id;
    let colorData = getColorClassById(thisColorId);
    return _theme.removeColor = colorData;
  });
  // console.log(_theme)
}

module.exports = {showColorDetails}