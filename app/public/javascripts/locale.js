window = window || {};
window.locale = window.locale || {}

locale.EN = {} // fill in for english localization

locale.NO = {

    buttons : {
        info    : 'Info',
        map     : 'Kart',
        media   : 'Media'
    },

    portraitWarning : 'Denne siden kan kun vises i portrettformat. Vennligst snu mobilen eller nettbrettet ditt.',

    footer : {
        login   : 'Logg inn',
        text    : '© Lier kommune 2017. ',
    },

    admin : {
        info : {
            loginLinkText   : 'Logg inn',
            loginText       : 'til Wordpress for å redigere bloggposter.'
        },
        tags : 'Tags',
        tagTooltip : 'Sett hvilke tags som skal være aktive. F.eks. "mittlier".'
    },

    notes : {
        geoMarkerText           : 'Flytt kartet og trykk her!',
        acceptPositionButton    : 'Ok',
        noteTitle               : 'Skriv et forslag!',
        explanation             : 'Skriv inn ditt forslag, legg ved tags og bilder, og trykk OK',
        addPhoto                : 'Legg ved bilde',
        send                    : 'Send inn',
        cancel                  : 'Avbryt',
        invalidImage            : 'Ikke et gyldig bildeformat. Vennligst prøv igjen!',
        keywords                : 'Nøkkelord',
        writtenBy               : 'Skrevet av',
        anon                    : 'Anonymt innlegg',
    },

    close : 'Lukk',
    addNoteHelp : 'Flytt kartet til ønsket sted. <br> Trykk Ok for å gi innspill.<br>',
    uploadHelpText : 'Last opp bilde...',
    pleaseFillIn : 'Vennligst fyll inn',
    ok : 'Ok',
    title : 'Overskrift',
    writeYourSuggestion : 'Skriv ditt forslag til #MittLier',
    yourName : 'Ditt navn',
    somethingWrong : 'Noe gikk galt. Vennligst prøv igjen.',
    fatalError : 'Noe veldig galt skjedde. Vennligst kontakt knutole@mapic.io',
    writeSearchWord : 'Skriv inn ditt søkeord, uten #',
    save : 'Lagre',
    export : 'Eksportér',
    deleteNote : 'Slett innlegg',
    confirmDelete : 'Er du sikker på at du vil slette innlegget ditt?',
    readMore : 'Les mer...',

    table : {
        address     : 'Adresse',
        tags        : 'Tags',
        text        : 'Tekst',
        latlng      : 'Kart',
        zoom        : 'Zoom',
        username    : 'Navn',
        time        : 'Dato',
        domain      : 'Domene',
        image       : 'Bilde',
        delete      : 'Slett',
        mapMarker   : "url('data:image/png;base64,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')",
        closeBtn    : 'Lukk vindu',
        confirmDelete : 'Er du sikker på at du vil slette forslaget? Dette kan ikke angres!'
    },


}