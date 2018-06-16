const apple_ontology =
    {
        "person": [],
        "location": [],
        "organization": [],
        "misc": [],
        "date": [],
        "time": [],
        "duration": [],
        "set": [],
        "money": [],
        "number": [],
        "ordinal": [],
        "percent": [],
        "email": [],
        "url": [],
        "city": [],
        "state_or_province": [],
        "country": [],
        "nationality": [],
        "religion": [],
        "job": [],
        "ideology": [],
        "criminal_charge": [],
        "cause_of_death": [],
        "anyimg": [],
        "img": [],
        "conference": [],
        "conference_acronym": [],
        "journal": [],
        "course": [],
        "topic": [],
        "professor": [],
        "sponsor_agency": [],
        "phone": [],
        "zip": [],
        "course_number": []
    }

const entity_types = Object.keys(apple_ontology);

var suggestions = [];

for( var i = 0; i < entity_types.length; i++ ){
    var temp = {
        label: "#"+entity_types[i].substr(0).split(' ').join('_').toLowerCase()
    }
    suggestions.push(temp)
}


export default suggestions;
