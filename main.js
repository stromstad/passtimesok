const axios = require('axios');

var includeEmpty = false;
var branchSearch = [];
var progress = 0;

process.argv.forEach((v, i) => {
    switch(v.toLowerCase()) {
        case "-i":
        case "--includeempty": includeEmpty = true; break;
        case "-b":
        case "--branches": branchSearch = process.argv[i+1].split(','); break;
    }
});

axios
    .get('https://pass-og-id.politiet.no/qmaticwebbooking/rest/schedule/appointmentProfiles/', { validateStatus: (s) => s === 200})
    .then((res) => {        
        var branches = res.data
            // Filter on id for passport services
            .filter(b => b.serviceGroups.find(sg => sg.services.find(s => s.publicId === "d1b043c75655a6756852ba9892255243c08688a071e3b58b64c892524f58d098")))
            // If branch search params exist, filter on those.
            .filter(b => branchSearch.length === 0 || branchSearch.find(bs => b.branchName.toLowerCase().includes(bs)));

        return Promise.all(checkBranches(branches)).then(values => {
            var results = values
                .sort((a, b) => (new Date(a.firstDate ? a.firstDate : 0)).getTime() - (new Date(b.firstDate ? b.firstDate : 0)).getTime())
                .filter(v => includeEmpty || v.firstDate !== undefined)
                .map(r => `${r.branch}: ${r.firstDate || "ingen"}`)
                ;
                process.stdout.write(results.join("\n"));
        });
        
        }
    );

const checkBranches = (branches) => branches.map(b => getBranchDates(b.branchPublicId, b.branchName, 100 / branches.length));

const getBranchDates = (branchPublicId, branchName, progressTickSize) => axios
        .get(`https://pass-og-id.politiet.no/qmaticwebbooking/rest/schedule/branches/${branchPublicId}/dates;servicePublicId=d1b043c75655a6756852ba9892255243c08688a071e3b58b64c892524f58d098;customSlotLength=10`)
        .then((res) => {
            progress += progressTickSize;
            process.stdout.write(progress.toFixed(2) + "%\r");
            return { branch: branchName, firstDate: res.data.find(d => d.date)?.date };
        })
        .catch(_ => {
            console.error("Fikk ikke hentet data for ", branchName);
            return { branch: branchName, firstDate: null }
        });