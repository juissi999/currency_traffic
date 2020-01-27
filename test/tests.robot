*** Settings ***
Documentation     Simple tests using SeleniumLibrary.
...               Tests currency_traffic UI.
Library           SeleniumLibrary
Suite Setup       setup_actions
Suite Teardown    Close Browser

*** Keywords ***
setup_actions
  Open Browser  ${URL}  ${BROWSER}
  Maximize Browser Window

addproduct
  [Arguments]  ${name}  ${price}
  Input Text  id=${#PURCH}  ${name}
  Input Text  id=${#PRICE}  ${price}
  Click Element  id=${#ADDB}

*** Variables ***
${URL}            http://localhost
${BROWSER}        Firefox
${#B}             cleardatab
${#BW}            cleardata_wrapper
${#PURCH}         purchase
${#PRICE}         price
${#ADDB}          addbutton
${TESTPURCHASE}   testpurchase
${#DELALLB}       data_final_rmb

*** Test Cases ***
Open Browser And Go To Page 
  Page Should Contain  Currency traffic
  
Test hide and show div
  Element Should Not Be Visible  id=${#BW}
  Click Element  id=${#B}
  Element Should Be Visible  id=${#BW}

Test show add product
  [Documentation]  Test add product. Use row's deletebuttons id and
  ...              testpurchases name as validator.
  Page Should Not Contain Element  id=rb0
  Page Should Not Contain  ${TESTPURCHASE}
  addproduct  ${TESTPURCHASE}  15
  Page Should Contain Element  id=rb0
  Page Should Contain  ${TESTPURCHASE}

Test remove a product with delbutton
  [Documentation]  Test open purchaselist, product being there and removing
  ...              product. Use row's deletebutton id as a validator.
  ...              TODO work out better validator. (button has indexed-id)
  Click Element  id=purchaselistb
  Page Should Contain Element  id=rb0
  Click Element  id=rb0
  Page Should Not Contain Element  id=rb0

Test delete all button
  [Documentation]  Test calculations for new product.
  addproduct  test1  15
  addproduct  test2  14.33
  addproduct  test3  1224,3399999
  Page Should Contain Element  id=rb0
  Click Element  id=${#DELALLB}
  Page Should Not Contain Element  id=rb0