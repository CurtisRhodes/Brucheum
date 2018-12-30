function setToolbar(tagName, pheight, pwidth) {

    $('' + tagName + '').summernote({
        height: pheight,
        width: pwidth,
        linewrapping: true,
        lineWrapping: true,
        //linewrapping: "true",
        //lineWrapping: "true",

        codemirror: {
            lineWrapping: true,
            mode: "htmlmixed",
            theme: "monokai"
        },
        toolbar: [
            ['codeview'],
            ['style', ['bold', 'italic', 'underline', 'clear']],
            //['font', ['strikethrough', 'superscript', 'subscript']],
            //['fontsize', ['fontname', 'fontsize']],
            //['insert', ['picture', 'link', 'video', 'table', 'hr']],
            ['insert', ['link', 'hr']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            //['height', ['height']]
        ]
    });
}