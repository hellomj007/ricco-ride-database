Hi, 

I have this project, where i need create a simple data entry tool, which will help me record the data of cab's trips. and related information. 

My friend yogesh have this cab service business called RiccoRide. as of now he does this manual work, notes down each things in a book. I tried using exl but that not much good for proper tool. 

He have multiple vehicles on his own, which he sends for trips. then he also can send someone else's vechicle on commission basic. and he have few commerical / big clients which is calls COMPANY, its kind of tieup type thing, where they continusly give trips as per their needs. 

So Yogesh have to do lots of data entry. 

Like trip records: 
Trip Details:
Date:
Trip Type: Company / Individual / Outsource 
Vehicle: Select from Available or Manual entry if its Outsourced 
Route: Manual Entry in Form
Type: Local or Outstation 
Company: Selection from Company Table
Kilometre: Manual entry in form
Fuel Type: CNG, Petrol, Diesel 
Fuel Cost: Manual Entry 
Payment Method: Online or Cash 
Payment: Amount Manual Entry 
Driver's Cost: Amount paid to Drive 
Maintenance: Any cost caused in trip. 
Maintenance Reason: Manual Entry 
Toll & Parking: (if company)
Start Date & Time: (if company)
End Date & Time:(if company)
Total Days: Auto calcualted
Vendor: Vendor table. (if outsourced) 

SO we might need to add :
Vehicle table, Maintaiance table(its diff than per trip maintaince), Drivers table, Company Table with all info about a company. 

Now, what i actualy want to do for him:
I want a simple tool, where he will be adding new trips. and all data gets auto done, like analytic, monthly yearly data. total income, profit, drive cost, maintaince cost etc. 



git remote add origin https://github.com/hellomj007/ricco-ride-tool.git

 
---
I am not a developer. Please tell me how can we do this? 
and do we need database? if yes, how could we do for now as initial start? we can then might have database but how to start without it? 

--

View trip detailes modal going to downlside, not centre to the screen. cant see all data, even scroll not working. 
same for edit, scroll not working so cant edit and save the data. and i hope delete would as for confirmation?

While adding a trip, in Vehicle and driver dropdown fields, please add option to "Add More" which should open a modal, to add new, this way we can easily add new driver or vehicle as needed. Is this easily possible in our current setup or it will make it complex?


---

Now, can you please improve styling a bit. Make it minimal and modern. make it mobile first, mobile responsive. We actually need to improve forms styling too. as of now on desktop its all seems bad UX. please try to improve it. 


I want to ask you about database migration, so what when i want to connect a database? as of now we are using JSON only, but this will not help when we actually want to go live. in fact we need to deploy the project too, so what do you suggest? the tool functions are good for now, and i am looking for very simple soltuion for now. 


from /manage-data.html, please remove that Data Management section complatly. I aslo want to mention that i see driver etc in dropdown of field in add trip form but not in manage data, and nothing happening when i add vehicle, driver, compenies and vendors at all. 