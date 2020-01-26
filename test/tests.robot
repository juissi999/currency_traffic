*** Settings ***
Documentation     Simple example using SeleniumLibrary.
Library           SeleniumLibrary

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
  Open Browser  ${URL}  ${BROWSER}
  Maximize Browser Window
  Page Should Contain  Currency traffic
  
Test hide and show div
  Element Should Not Be Visible  id=${#BW}
  Click Element  id=${#B}
  Element Should Be Visible  id=${#BW}

Test add product
  Input Text  id=${#PURCH}  test
  Input Text  id=${#PRICE}  15
  Click Element  id=${#ADDB}
  Page Should Contain Element  id=rb0
  Close Browser