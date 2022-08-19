let page = document.getElementById("buttonDiv");
let selectedClassName = "current";
const presetButtonColors = ["#3aa757", "#e8453c", "#f9bb2d", "#4688f1"];
let currentSettings;
// Reacts to a button click by marking the selected button and saving
// the selection
const displayUpdateError = () => {
    console.log("Something happened while updating settings!")
}
const displayUpdateSuccess = () => {
    console.log("Update settings successful")
}
function handleButtonClick(event) {
    // Remove styling from the previously selected color
    let current = event.target.parentElement.querySelector(
        `.${selectedClassName}`
    );
    if (current && current !== event.target) {
        current.classList.remove(selectedClassName);
    }

    // Mark the button as selected
    let color = event.target.dataset.color;
    event.target.classList.add(selectedClassName);
    chrome.storage.sync.set({ color });
}

// Add a button to the page for each supplied color
function constructOptions(buttonColors) {
    chrome.storage.sync.get("color", (data) => {
        let currentColor = data.color;
        // For each color we were provided…
        for (let buttonColor of buttonColors) {
            // …create a button with that color…
            let button = document.createElement("button");
            button.dataset.color = buttonColor;
            button.style.backgroundColor = buttonColor;

            // …mark the currently selected color…
            if (buttonColor === currentColor) {
                button.classList.add(selectedClassName);
            }

            // …and register a listener for when that button is clicked
            button.addEventListener("click", handleButtonClick);
            page.appendChild(button);
        }
    });
}
const parseBlacklist = (list) => {
    return list.split(',');
}
const updateSettings = async (settings_alias) => {
    return new Promise((resolve, reject) => {
        if (settings_alias === "general")
        {
            
            //Here, I grab all the elements and check if there are any changes. If there are, I reflect these in currentSettings
            document.getElementById('highlight-auto').checked ? currentSettings.highlightEnabled = 1 : currentSettings.highlightEnabled = 0;
            document.getElementById('blacklist-textarea').value != '' ? currentSettings.blacklistedTerms = parseBlacklist(document.getElementById('blacklist-textarea').value) : currentSettings.blacklistedTerms = ''
            document.getElementById('external-search').checked ? currentSettings.allowExternalSearch = 1 : currentSettings.allowExternalSearch = 0;
            //Then, I update the local storage with these new settings
            console.log(currentSettings);
            chrome.storage.sync.set({'general_settings': JSON.stringify(currentSettings)}, () => {
                console.log("Successfully updated new " + settings_alias + ' settings.');
                return resolve(true);
            });
        }
    });
    
}
const constructGeneralSettingsJSON = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['general_settings'], function(result) {
            //If there are no settings saved in local storage
            console.log(result)
            if (Object.keys(result) < 1)
            {
                const defaultSettings = {
                    highlightEnabled: 0,
                    blacklistedTerms: [],
                    filterByOrg: [],
                    allowExternalSearch: 0
                }
                chrome.storage.sync.set({general_settings: JSON.stringify(defaultSettings)}, () => {
                    console.log("Successfully saved default settings");
                    let settings = defaultSettings;
                    document.getElementById('highlight-auto').checked = settings.highlightEnabled ? true : false;
                    if (settings.blacklistedTerms && settings.blacklistedTerms.length > 0)
                        for (let i = 0; i < settings.blacklistedTerms.length; i++)
                            document.getElementById('blacklist-textarea').value += settings.blacklistedTerms[i] + ', ';
                    if (settings.filterByOrg && settings.filterByOrg.length > 0)
                        console.log("Filter by Organization Settings coming soon");
                    if (settings.allowExternalSearch === 1)
                        document.getElementById('external-search').checked = true;
                    return resolve(defaultSettings)
                })
               
            }
            else if (result)
            {
                //Parse the string that was obtained into a json
                let settings = JSON.parse(result.general_settings);
                document.getElementById('highlight-auto').checked = settings.highlightEnabled ? true : false;
                if (settings.blacklistedTerms && settings.blacklistedTerms.length > 0)
                    for (let i = 0; i < settings.blacklistedTerms.length; i++)
                        document.getElementById('blacklist-textarea').value += settings.blacklistedTerms[i] + ',';

                if (settings.filterByOrg && settings.filterByOrg.length > 0)
                    console.log("Filter by Organization Settings coming soon");
                if (settings.allowExternalSearch === 1)
                    document.getElementById('external-search').checked = true;
                return resolve(settings)
                
            }
          });
        });
}
constructAccessibilitySettingsJSON = async () => {
    return new Promise((resolve, reject) => {
        //This will do something some day, but not today
    })
}
// Initialize the page by constructing the color options
//constructOptions(presetButtonColors);



/**
 * 
 */
const constructGeneralSettings = () => {
    let generalSettingsPage = `
        <div class="main-content-header fade-in">
            General Settings
        </div>
        
        <div class="main-content-positioner fade-in">
            <div class="main-content-container">
                <section class="highlight-settings">
                    <div class="highlight-settings-header">
                        External Search Settings
                    </div>
                    <div class="external-search-settings-checkbox">
                        <input type="checkbox" id="external-search" name="external-search" value="">
                        <label for="external-search"> Enable External Search (find definitions even if they are not standard-backed) </label>
                    </div>
                </section>
                <section class="highlight-settings">
                    <div class="highlight-settings-header">
                        Highlight Settings
                    </div>
                    <div class="highlight-settings-checkbox">
                        <input type="checkbox" id="highlight-auto" name="highlight-auto" value="">
                        <label for="vehicle1"> Enable automatic search on term highlight </label>
                    </div>
                    <div class="highlight-settings-header">
                        Page Blacklist
                    </div>
                    <div class="highlight-settings-subtitle">
                        input pages where automatic search on highlight should not be enabled
                    </div>
                    <div class="highlight-settings-blacklist">
                        <textarea id="blacklist-textarea" class="blacklist-textarea"></textarea>
                    </div>
                </section>
                <section class="filter-settings">
                    <div class="filter-settings-header">
                        Filter Settings
                    </div>
                    <div class="filter-settings-group">
                        <div class="filter-settings-primary-checkbox">
                            <div class="checkbox-element">
                                <input type="checkbox" id="filter-org" name="filter-org" value="">
                                <label for="vehicle1"> Filter by Defining Organization </label>
                            </div>
                            <div class="checkbox-element">
                                <input type="checkbox" id="filter-field" name="filter-field" value="">
                                <label for="vehicle1"> Filter by Field </label>
                            </div>
                            <div class="checkbox-element">
                                <input type="checkbox" id="filter-acronyms" name="filter-acronyms" value="">
                                <label for="vehicle1"> Only Acronyms </label>
                            </div>
                            <div class="checkbox-element">
                                <input type="checkbox" id="filter-terms" name="filter-terms" value="">
                                <label for="vehicle1"> Only Terms </label>
                            </div>
                        </div>
                        <div class="filter-settings-secondary-checkbox">
                           
                        </div>
                    </div>
                </section>
                <div class="save-settings-button">
                    <button id="save-button">Save</button>
                </div>
            </div>
        </div>
     `
     document.getElementsByClassName('main-content')[0].innerHTML = generalSettingsPage;
     constructGeneralSettingsJSON().then((settings) => {
        currentSettings = settings;
        console.log(currentSettings);
     })
     document.getElementById('save-button').addEventListener('click', (e) => {
        updateSettings('general')
        .then((success) => { //Updating settings operation succeeds
            if (success)
                displayUpdateSuccess();
        })
        .catch( (err) => { //Updating settings operation fails
            console.log(err);
            displayUpdateError()
        });
     })
}
const constructTermRequest = () => {
    let termRequestsPage = `       
    <div class="main-content-header fade-in">
    Request Term
</div>

<div class="main-content-positioner fade-in">
    <div class="main-content-container">
        <div class="requested-term-header">
            <div>Term Title</div>
            <input/>
        </div>
        <div  class="requested-term-definitions">
            <div class="requested-term-header">Definitions(s)</div>
            <div class="requested-definitions-button">
                <button>Add More + </button>
            </div>
            <div class="requested-definitions-cards">
                <div class="definition-card">
                    <!--Ideally, these definition cards would be of fixed width-->
                    <div class="definition-card-header">Meaning 1</div>
                    <div class="definition-card-def-group">
                        <div class="group-header">Definition:</div>
                        <textarea id="definition-input-1" class="group-input-textarea"></textarea>
                    </div>
                    <div class="definition-card-source-group">
                        <div class="group-header">Source:</div>
                        <input id="source-input-1" class="group-input"/>
                    </div>
                </div>
                <div class="definition-card">
                    <!--Ideally, these definition cards would be of fixed width-->
                    <div class="definition-card-header">Meaning 1</div>
                    <div class="definition-card-def-group">
                        <div class="group-header">Definition:</div>
                        <textarea id="definition-input-1" class="group-input-textarea"></textarea>
                    </div>
                    <div class="definition-card-source-group">
                        <div class="group-header">Source:</div>
                        <input id="source-input-1" class="group-input"/>
                    </div>
                </div>
            </div>

            <div class="notification-options">
                <div class="requested-term-header">
                    Notification Options
                </div>
                <div class="notification-options-checkbox">
                    <input type="checkbox" id="enable-emails" name="enable-emails" value="">
                    <label for="vehicle1"> Be notified when your term is added </label>
                </div>
                <div class="notification-options-email">
                    <div class="notification-options-subtitle">
                        Email for notification:
                    </div>
                    <input id="email-notification" value="example@email.com">
                </div>
            </div>
            <div class="submit-row">
                <button id="submit-button" class="submit-button">Submit Request</button>
            </div>
        </div>
    </div>
</div>
`

    document.getElementsByClassName('main-content')[0].innerHTML = termRequestsPage;
}
const constructAccessiblityPage = () => {
    let accessibilitySettingsPage = `
    `

    document.getElementsByClassName('main-content')[0].innerHTML = accessibilitySettingsPage;
    constructAccessibilitySettingsJSON().then((settings) => {
        currentSettings = settings;
        console.log(currentSettings);
    })
}

const mountGeneral = () => {
    let generalButton = document.getElementById('general-button');
    let requestTermsButton = document.getElementById('request-terms-button');
    let accessibilityButton = document.getElementById('accessibility-button');
    generalButton.addEventListener('click', constructGeneralSettings)
    requestTermsButton.addEventListener('click', constructTermRequest);
    accessibilityButton.addEventListener('click', constructAccessiblityPage);
    constructGeneralSettings();   
}
document.addEventListener('DOMContentLoaded', function() {
    mountGeneral();
}, false);


const filterByOrg = `
<div class="filter-settings-secondary-checkbox">
    <div class="checkbox-element">
        <input type="checkbox" id="filter-nist" name="filter-nist" value="">
        <label for="vehicle1"> NIST </label>
    </div>
    <div class="checkbox-element">
        <input type="checkbox" id="filter-iso" name="filter-iso" value="">
        <label for="vehicle1"> ISO </label>
    </div>
    <div class="checkbox-element">
        <input type="checkbox" id="filter-ietf" name="filter-ietf" value="">
        <label for="vehicle1"> IETF </label>
    </div>
    <div class="checkbox-element">
        <input type="checkbox" id="filter-psissc" name="filter-psissc" value="">
        <label for="vehicle1"> PCI SSC </label>
    </div>
</div>
`