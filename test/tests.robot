*** Settings ***
Documentation     Simple example using SeleniumLibrary.
Library           SeleniumLibrary
Suite Setup       setup_actions
Suite Teardown    Close Browser

*** Keywords ***
setup_actions
  Open Browser  ${URL}  ${BROWSER}
  Maximize Browser Window


*** Variables ***
${URL}  http://localhost
${BROWSER}  Firefox
${#B}  cleardatab
${#BW}  cleardata_wrapper
${#PURCH}  purchase
${#PRICE}  price
${#ADDB}  addbutton

*** Test Cases ***
Open Browser And Go To Page 
  Page Should Contain  Currency traffic
  
Test hide and show div
  Element Should Not Be Visible  id=${#BW}
  Click Element  id=${#B}
  Element Should Be Visible  id=${#BW}

Test add product
  Page Should Not Contain Element  id=rb0
  Input Text  id=${#PURCH}  test
  Input Text  id=${#PRICE}  15
  Click Element  id=${#ADDB}
  Page Should Contain Element  id=rb0

Test remove product
  Click Element  id=purchaselistb
  Page Should Contain Element  id=rb0
  Click Element  id=rb0
  Page Should Not Contain Element  id=rb0