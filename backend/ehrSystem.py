from abc import ABC, abstractmethod
import random

# Define an abstract base class with an abstract constructor
class ehrElement(ABC):

    @abstractmethod
    def __init__(self, basicInfo):
        self.my_id = self.generateID()
        self.basicInfo = basicInfo
        
    @abstractmethod
    def generateEmbeddingString(self) -> str:
        pass

    def generateID(self):
        return random.randint(100000000, 999999999)

class patient(ehrElement):

    def __init__(self, basicInfo):
        super().__init__(basicInfo) 
        self.visits = []
        self.conditions = []
        self.procedures = []
        self.practitioners = set()
        self.serviceProviders = set()

    def generateEmbeddingString(self):
        conditionsStr = "\n".join([c["name"] + " starting on " + c["dateStr"] for c in self.conditions if c])
        proceduresStr = "\n".join([pr["description"] + " starting on " + pr["start"] + " ending on " + pr["end"] + " with a status of " + pr["status"] + "." for pr in self.procedures if pr])
        practitionersStr = ", ".join([prac.basicInfo["name"] for prac in self.practitioners])
        serviceProvidersStr = "\n".join([" ".join([sp.basicInfo["name"], sp.basicInfo["address"], sp.basicInfo["postalCode"]]) for sp in self.serviceProviders])

        visitsStrLst = []
        for visit in self.visits:
            notes = visit["notes"]
            start, end = visit["start_and_end_time"]
            practitioners = visit["practitioners"].basicInfo["name"]
            sp = visit["serviceProviders"]
            facilitiesStr = " ".join([sp.basicInfo["name"], sp.basicInfo["address"], sp.basicInfo["postalCode"]])
            
            toAdd = notes + " at " + facilitiesStr + " with " + practitioners + " from " + str(start) + " to " + str(end) + "."
            visitsStrLst.append(toAdd)
        
        visitsStr = "\n".join(visitsStrLst)

        toRet = "This is " + " ".join([self.basicInfo["firstName"], self.basicInfo["lastName"]]) + " They are a " + \
        self.basicInfo["age"] + " year old " + self.basicInfo["gender"] + " that lives in " + self.basicInfo["address"] + \
        " and speaks " + self.basicInfo["languageSpoken"] + ".\n" + \
        "They have had the following conditions:" + "\n" + conditionsStr + ".\n\n" + \
        "Undergone the following procedures:" + "\n" + proceduresStr + ".\n\n" + \
        "Had the following medical practitioners:" + "\n" + practitionersStr + ".\n\n" + \
        "Have been in the following hospitals and/or had the following medical service providers:" + \
        "\n" + serviceProvidersStr + ".\n\n" + \
        "And have had the following visit history:" + "\n" + visitsStr

        return toRet

class practitioner(ehrElement):

    def __init__(self, basicInfo):
        super().__init__(basicInfo) 
        self.conditions = []
        self.patients = set()
        self.serviceProviders = set()
        self.procedures = []

    def generateEmbeddingString(self):
        patientsStr = "\n".join([" ".join([p.basicInfo["firstName"], p.basicInfo["lastName"]]) for p in self.patients])
        conditionsStr = "\n".join([c["name"] + " starting on " + c["dateStr"] for c in self.conditions if c])
        proceduresStr = "\n".join([pr["description"] + " starting on " + pr["start"] + " ending on " + pr["end"] + " with a status of " + pr["status"] + "." for pr in self.procedures if pr])

        toRet = "This is " + self.basicInfo["name"] + ". They have had the following patients:" + "\n" + \
        patientsStr + "\n" + "Treated the following conditions:" + "\n" + conditionsStr + "\n" + "And done the following procedures:" + \
        "\n" + proceduresStr

        return toRet

class serviceProvider(ehrElement):

    def __init__(self, basicInfo):
        super().__init__(basicInfo) 
        self.conditions = []
        self.practitioners = set()
        self.patients = set()
        self.procedures = []

    def generateEmbeddingString(self):
        patientsStr = "\n".join([" ".join([p.basicInfo["firstName"], p.basicInfo["lastName"]]) for p in self.patients])
        conditionsStr = "\n".join([c["name"] + " starting on " + c["dateStr"] for c in self.conditions if c])
        proceduresStr = "\n".join([pr["description"] + " starting on " + pr["start"] + " ending on " + pr["end"] + " with a status of " + pr["status"] + "." for pr in self.procedures if pr])
        practitionersStr = ", ".join([prac.basicInfo["name"] for prac in self.practitioners])

        toRet = "This facility is " + self.basicInfo["name"] + ".\n" + \
        "It is located at " + self.basicInfo["address"] + " " + self.basicInfo["postalCode"] + ".\n" + \
        "The type of organization is " + self.basicInfo["type_of_organization"] + "." + \
        "This facility has treated the following patients:" + "\n" + patientsStr + "\n\n" + \
        "The following conditions:" + "\n" + conditionsStr + "\n\n" + \
        "Facilitated the following procedures:" + "\n" + proceduresStr + "\n\n" + \
        "And has had the following medical practitioners:" + "\n" + practitionersStr + ".\n\n"

        return toRet
