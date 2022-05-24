const axios = require('axios');
const open = require('open');

var includeEmpty = false;
var branchSearch = [];
var poll = false;
var top = false;
var beforeDate = null;
var hasOpenedBrowser = false;
var progress = 0;

process.argv.forEach((v, i) => {
    switch(v.toLowerCase()) {
        case "-i":
        case "--includeempty": includeEmpty = true; break;
        case "-b":
        case "--branches": branchSearch = process.argv[i+1].split(','); break;
        case "-p":
        case "--poll": poll = true; break;
        case "-t":
        case "--top": top = true; break;
        case "-d":
        case "--date": beforeDate = process.argv[i+1]; break;
    }
});

const search = () => {
    progress = 0;
    axios
        .get('https://pass-og-id.politiet.no/qmaticwebbooking/rest/schedule/appointmentProfiles/', { validateStatus: (s) => s === 200})
        .then((res) => {        
            var branches = res.data
                // Filter on id for passport services
                .filter(b => b.serviceGroups.find(sg => sg.services.find(s => s.publicId === "d1b043c75655a6756852ba9892255243c08688a071e3b58b64c892524f58d098")))
                // If branch search params exist, filter on those.
                .filter(b => branchSearch.length === 0 || branchSearch.find(bs => b.branchName.toLowerCase().includes(bs)));

            return Promise.all(checkBranches(branches)).then(values => {
                process.stdout.write("\n");
                var results = values
                    .sort((a, b) => (new Date(a.firstDate ? a.firstDate : 0)).getTime() - (new Date(b.firstDate ? b.firstDate : 0)).getTime())
                    .filter(v => includeEmpty || v.firstDate !== undefined);
                var stringResults = results.map(r => `${r.branch}: ${r.firstDate || "ingen"}`);

                    if (!hasOpenedBrowser && (beforeDate && new Date(results[0].firstDate).getTime() < new Date(beforeDate).getTime())) {
                        open(`https://pass-og-id.politiet.no/timebestilling/index.html#/preselect/branch/${results[0].id}?preselectFilters=off`
                            , { app: 'firefox'});
                        hasOpenedBrowser = true;
                    }

                    if (top) process.stdout.write(`${stringResults[0]}\n`);
                    else process.stdout.write(stringResults.join("\n"));
            });
            
            }
        )
        .catch(_ => console.error("Fikk ikke hentet kontorer."))
        .then(r => poll ? search() : r);
}
    
search();

const checkBranches = (branches) => branches.map(b => getBranchDates(b.branchPublicId, b.branchName, 100 / branches.length));

const getBranchDates = (branchPublicId, branchName, progressTickSize) => axios
        .get(`https://pass-og-id.politiet.no/qmaticwebbooking/rest/schedule/branches/${branchPublicId}/dates;servicePublicId=d1b043c75655a6756852ba9892255243c08688a071e3b58b64c892524f58d098;customSlotLength=10`)
        .then((res) => {
            progress += progressTickSize;
            process.stdout.write(`\r${progress.toFixed(2)}%`);
            return { branch: branchName, firstDate: res.data.find(d => d.date)?.date, id: branchPublicId };
        })
        .catch(_ => {
            console.error("Fikk ikke hentet data for ", branchName);
            return { branch: branchName, firstDate: null, id: branchPublicId  }
        });