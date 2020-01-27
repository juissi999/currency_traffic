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
@{PRICES}         1  14.33  1224,3399999
@{falseprices}    abc  ${EMPTY}  aturäsdfölkjerlkjsfsöjlsdflje

*** Test Cases ***
Page contains title
  Page Should Contain  Currency traffic
  
Hide and show sections
  Element Should Not Be Visible  id=${#BW}
  Click Element  id=${#B}
  Element Should Be Visible  id=${#BW}

Changing category
  [Documentation]  Test changing of category works.
  ...              Multiple classes handled now with only simple string.
  Element Attribute Value Should Be  xpath://button[@data-category="0"]  class  categorybutton selected
  Click Element  xpath://button[@data-category="3"]
  Element Attribute Value Should Be  xpath://button[@data-category="0"]  class  categorybutton
  Element Attribute Value Should Be  xpath://button[@data-category="3"]  class  categorybutton selected
  Click Element  xpath://button[@data-category="0"]

Adding a product shows on list
  [Documentation]  Test add product. Use row's deletebuttons id and
  ...              testpurchases name as validator.
  Page Should Not Contain Element  id=rb0
  Page Should Not Contain  ${TESTPURCHASE}
  addproduct  ${TESTPURCHASE}  15
  Page Should Contain Element  id=rb0
  Page Should Contain  ${TESTPURCHASE}

Remove a product with delbutton
  [Documentation]  Test open purchaselist, product being there and removing
  ...              product. Use row's deletebutton id as a validator.
  ...              TODO work out better validator. (button has indexed-id)
  Click Element  id=purchaselistb
  Page Should Contain Element  id=rb0
  Click Element  id=rb0
  Page Should Not Contain Element  id=rb0

Delete all button
  [Documentation]  Test calculations for new product.
  FOR  ${ELEMENT}  IN  @{PRICES}
      addproduct  test  ${ELEMENT}
  END
  Page Should Contain Element  id=rb0
  Click Element  id=${#DELALLB}
  Page Should Not Contain Element  id=rb0

Not able to add product with zero price or alphabet price
  Page Should Not Contain Element  id=rb0
  FOR  ${ELEMENT}  IN  @{falseprices}
    addproduct  test  ${ELEMENT}
  END
  Page Should Not Contain Element  id=rb0