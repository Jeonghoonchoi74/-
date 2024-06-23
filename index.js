document.cookie = "safeCookie1=foo; SameSite=Lax"; 
document.cookie = "safeCookie2=foo"; 
document.cookie = "crossCookie=bar; SameSite=None; Secure";

window.onclick = (e) => {
    if (!e.target.matches('.dropbtn') && !e.target.matches('.dropbtn_icon') && !e.target.matches('.dropbtn_click') && !e.target.matches('.dropbtn_content')) {
        let dropdowns = document.getElementsByClassName("dropdown-content");

        let dropbtn_icon = document.querySelector('.dropbtn_icon');
        let dropbtn_content = document.querySelector('.dropbtn_content');
        let dropbtn_click = document.querySelector('.dropbtn_click');
        let dropbtn = document.querySelector('.dropbtn');

        let i;
        for (i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}


$(document).ready(function () {
    let queryName = "소설";
    let sortRule = "SalesPoint";
    let page = 1;
    let booksPerPage = 20;
    let lastPage;
    let QType = "Title";
    let CID = 0;

    loadBooks = () => {
        $.ajax({
            method: "GET",
            url: "https://cors-anywhere.herokuapp.com/http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=ttblsh1223120225002&Query=" + queryName + "&QueryType=" + QType + "&MaxResults=" + booksPerPage + "&Sort=" + sortRule + "&start=" + page + "&CategoryId=" + CID + "Cover=Mid&SearchTarget=Book&output=js&Version=20131101",
        })
            .done(function (msg) {
                $("#books").empty();
                lastPage = msg.totalResults / msg.itemsPerPage + 1;
                $.each(msg.item, function (index, item) {
                    $("#books").append(
                        $('<hr><div class="loader"><img class="book" id= '+item.isbn+' src= '+item.cover+' title='+item.title+'/><span class ="des">'+item.description+'</span><div class="title">'+item.title+'</div></div><hr>')
                    );
                });
            });
    }

    loadBooks();

    class Stack {
        constructor() {
            this._arr = [];
        }
        push(item) {
            this._arr.push(item);
        }
        pop() {
            return this._arr.pop();
        }
        peek() {
            return this._arr[this._arr.length - 1];
        }
        empty() {
            return this._arr.length == 0;
        }
    }

    const recentStack = new Stack();
    let recentBooks = [];
    let recentCount = 0;
    $(document).on("click", ".book", function (e) {
        const receivedData = e.target.id;
        const isbn = receivedData.split(' ')[0];
        $.ajax({
            method: "GET",
            url: "https://cors-anywhere.herokuapp.com/http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=ttblsh1223120225002&Query=" + isbn + "&QueryType=Isbn&MaxResults=1&start=1&SearchTarget=Book&output=js&Version=20131101",
        })
            .done(function (msg) {
                console.log(msg);
                $.each(msg.item, function (index, item) {
                    let categoryName = item.categoryName.split('>');
                    $("#thumb").attr('src', item.cover);
                    $("#title").text(item.title);
                    $("#isbn").text(item.isbn);
                    $("#author").text(item.author);
                    $("#pub").text(item.publisher);
                    $("#price").text(item.priceSales);
                    $("#category").text(categoryName[0] + '>' + categoryName[1]);
                    $(".bookdetail").text(item.description);
                });
                $("#popup01").show();
                $("body").append('<div class="backon"></div>');

                if (recentCount == 0) {
                    recentCount++;
                    recentBooks.push(msg.item[0]);
                    loadDetail();
                } else {
                    let i = recentBooks.findIndex(x => x.isbn === msg.item[0].isbn);
                    if (i == -1) {
                        recentCount++;
                        recentBooks.push(msg.item[0]);
                        loadDetail();
                        if (recentCount == 4) {
                            $(".recentBooks:last-of-type").remove();
                            $(".deleteRecent:last-of-type").remove();
                            recentStack.push(recentBooks[0]);
                            recentBooks.shift();
                            recentCount--;
                        }
                    } else {
                        recentBooks.splice(i, 1);
                        recentBooks.push(msg.item[0]);
                        $(".recentBooks").eq(recentCount - i - 1).remove();
                        $(".deleteRecent").eq(recentCount - i - 1).remove();
                        loadDetail();
                    }
                }

            });
        loadDetail = () => {
            $("#recent").prepend(
                $('<img/>', {
                    class: 'book recentBooks',
                    id: recentBooks.at(-1).isbn,
                    src: recentBooks.at(-1).cover,
                    title: recentBooks.at(-1).title,
                }),
            )
            $("#recent").prepend(
                $("<div class='deleteRecent'>x</div>"),
            )
        }
    });

    $("body").on("click", function (event) {
        if (event.target.className == 'close' || event.target.className == 'backon') {
            $("#popup01").hide();
            $(".backon").hide();
        }
        if (event.target.className == 'deleteRecent') {
            console.log($(".deleteRecent").index(event.target));
            recentBooks.splice(recentBooks.length - $(event.target).index(), 1);
            $(event.target).next().remove();
            $(event.target).remove();
            recentCount--;
            if (!recentStack.empty()) {
                recentPop = recentStack.pop();
                if (recentBooks.findIndex(x => x.isbn === recentPop.isbn) == -1) {
                    recentBooks.unshift(recentPop);
                    recentCount++;
                    $("#recent").append(
                        $("<div class='deleteRecent'>x</div>"),
                    )
                    $("#recent").append(
                        $('<img/>', {
                            class: 'book recentBooks',
                            id: recentPop.isbn,
                            src: recentPop.cover,
                            title: recentPop.title,
                        }),
                    )
                }
            }
            console.log(recentBooks);

        }
    });

    $("#sub").click(function () {
        queryName = $("#search").val();
        loadBooks();
    })


    $("#search").keyup(function (e) {
        if (e.keyCode == 13) {
            $("#sub").click()
        }
    })



    $(".book-category").click(function (e) {
        switch (e.target.id) {
            case '소설/시':
                queryName = "소설";
                CID = 1;
                break;
            case '에세이':
                CID = 55889;
                queryName = "에세이";
                break;
            case '경제/경영':
                CID = 7605;
                queryName = "경제";
                break;
            case '정치/사회':
                CID = 51064;
                queryName = "정치";
                break;
            case '잡지':
                CID = 2913;
                queryName = "잡지";
                break;
            case '참고서':
                CID = 8257;
                queryName = "교재";
                break;
        }
        loadBooks();
    })

    $(".movePage").click(function (event) {
        if (event.target.id == 'prevPage') {
            if (page > 1) {
                page--;
            }
            btnDisable();
        } else {
            page++;
            btnDisable();
        }
        loadBooks();
    })



    btnDisable = () => {
        let prev = document.getElementById('prevPage');
        let next = document.getElementById('nextPage');
        if (page < 2) {
            prev.disabled = true;
        } else {
            prev.disabled = false;
        }

        if (page > lastPage - 1) {
            next.disabled = true;
        } else {
            next.disabled = false;
        }

    }

    dropdown = () => {
        let v = document.querySelector('.dropdown-content');
        let dropbtn = document.querySelector('.dropbtn')
        v.classList.toggle('show');
        dropbtn.style.borderColor = 'rgb(94, 94, 94)';
    }

    showMenu = (value) => {
        let dropbtn_icon = document.querySelector('.dropbtn_icon');
        let dropbtn_content = document.querySelector('.dropbtn_content');
        let dropbtn_click = document.querySelector('.dropbtn_click');
        let dropbtn = document.querySelector('.dropbtn');

        dropbtn_icon.innerText = '';
        dropbtn_content.innerText = value;
        dropbtn_content.style.color = '#252525';
        dropbtn.style.borderColor = '#3992a8';

        switch (value) {
            case "정확도순":
                sortRule = "Accuracy";
                break;
            case "최신순":
                sortRule = "PublishTime";
                break;
            case "가나다순":
                sortTule = "Title";
                break;
            case "판매순":
                sortRule = "SalesPoint";
                break;
            case "평점순":
                sortRule = "CustomerRating";
                break;
        }
        loadBooks();
    }
})
