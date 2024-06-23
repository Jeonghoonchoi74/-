document.cookie = "safeCookie1=foo; SameSite=Lax";
document.cookie = "safeCookie2=foo";
document.cookie = "crossCookie=bar; SameSite=None; Secure";

$(document).ready(function () {
    let queryName = "소설";
    let sortRule = "SalesPoint";
    let page = 1;
    let booksPerPage = 100;
    let lastPage;
    let QType = "Keyword";
    let CID = 0;
    let loadCount = 0;
    const selected_books = [];
    loadBooks = () => {
        $.ajax({
            method: "GET",
            url: "https://cors-anywhere.herokuapp.com/http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=ttblsh1223120225002&Query=" + queryName + "&QueryType=" + QType + "&MaxResults=" + booksPerPage + "&Sort=" + sortRule + "&start=" + page + "&CategoryId=" + CID + "&Cover=MidBig&SearchTarget=Book&output=js&Version=20131101",
        })
            .done(function (msg) {
                lastPage = msg.totalResults / msg.itemsPerPage + 1;
                console.log(page);
                $.each(msg.item, function (index, item) {
                    let categoryName = item.categoryName.split('>');
                    $("#books").append(
                        $('<img/>', {
                            class: 'book',
                            id: categoryName,
                            src: item.cover,
                            title: item.title,
                            alt: item.categoryId,
                        }),
                    );
                });
            });
    }

    $(document).on("click", ".book", function (e) {
        selected_books.push(e.target.id + e.target.alt);
        $(this).toggleClass('bw');
    })

    $(window).scroll(function () {
        let scrT = $(window).scrollTop();
        if (scrT == $(document).height() - $(window).height()) {
            if (lastPage > loadCount) {
                $.LoadingOverlay("show", {
                    background: "rgba(0, 0, 0, 0.5)",
                    image: "",
                    maxSize: 60,
                    fontawesome: "fa fa-spinner fa-pulse fa-fw",
                    fontawesomeColor: "#FFFFFF",
                });
                page++;
                loadBooks();
                setTimeout(function () {
                    $.LoadingOverlay("hide");
                }, 4000);
                loadCount++;
            }
        }
    })

    function loading() {
        $("#tutText").text("선호하는 도서를 선택해주세요");
        $(".book-category").empty();
        const compBtn = document.getElementById('complete');
        compBtn.style.display = 'inline-block';
        $.LoadingOverlay("show", {
            background: "rgba(0, 0, 0, 0.5)",
            image: "",
            maxSize: 60,
            fontawesome: "fa fa-spinner fa-pulse fa-fw",
            fontawesomeColor: "#FFFFFF",
        });
        loadBooks();
        setTimeout(function () {
            $.LoadingOverlay("hide");
        }, 3000);
    }

    $(".book-category").click(function (e) {
        switch (e.target.id) {
            case '소설':
                queryName = "소설";
                loading();
                break;
            case '시':
                queryName = "에세이";
                loading();
                break;
            case '희곡':
                queryName = "희곡";
                loading();
                break;
            case '에세이':
                queryName = "에세이";
                loading();
                break;
        }
    })

    class Tree {
        constructor(value) {
            // constructor로 만든 객체는 트리의 Node가 됩니다.
            this.value = value;
            this.count = 0;
            this.CID = 0;
            this.children = [];
        }

        // 트리의 삽입 메서드를 만듭니다.
        insertNode(value) {
            // 값이 어떤 이름으로 만들어지고 어느 위치에 붙는지 떠올리는 것이 중요합니다.
            // TODO: 트리에 붙게 될 childNode를 만들고, children에 넣어야 합니다.
            const childNode = new Tree(value);
            this.children.push(childNode);
        }

        // 트리 안에 해당 값이 포함되어 있는지 확인하는 메서드를 만듭니다.
        contains(value) {
            // TODO: 값이 포함되어 있다면 true를 반환하세요. 
            if (this.value === value) {
                return true;
            }
            // TODO: 값을 찾을 때까지 children 배열을 순회하며 childNode를 탐색하세요.
            for (let i = 0; i < this.children.length; i++) {
                const childNode = this.children[i];
                if (childNode.contains(value)) {
                    return true;
                }

            }

            // 전부 탐색했음에도 불구하고 찾지 못했다면 false를 반환합니다.
            return false;
        }
    }

    const sel_books = new Tree();

    $("#complete").click(function (e) {
        book_count = selected_books.length;
        $.each(selected_books, function (index1, item1) {
            let target = sel_books;
            let categoryName = item1.split(',');
            let ind = 0;
            $.each(categoryName, function (index2, item2) {
                if (!target.contains(item2)) {
                    ind = target.children.length;
                    target.insertNode(item2);
                } else {
                    ind = target.children.findIndex(function (e) {
                        return e.value === item2;
                    })
                }
                target = target.children[ind];
                target.count++;
                console.log(sel_books);
            })
        })
        console.log(sel_books);

        let largest = 0;
        let largestValue = 0;
        let final_value = 0;

        function findLarger(item) {
            if (largest < item.count) {
                largest = item.count;
                largestValue = item.value;
            }
        }

        function final(item, n) {
            if (largest >= book_count / n) {
                final_value = largestValue;
            } else {
                item.children.splice(0, item.children.length);
            }
        }

        function recommend(CID) {
            let Id = 0;
            for (let i = CID.length - 1; !isNaN(CID[i]); i--) {
                Id += CID[i] * (10 ** (CID.length - i - 1));
            }
            console.log(Id);
            $.ajax({
                method: "GET",
                url: "https://cors-anywhere.herokuapp.com/http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=ttblsh1223120225002&Query=문학동네&Sort=SalesPoint&QueryType=Publisher&CategoryId=" + Id + "&MaxResults=1&start=" + Math.floor(Math.random() * 10) + "&SearchTarget=Book&output=js&Version=20131101",
            })
                .done(function (msg) {
                    
                    console.log(msg);
                    localStorage.setItem("bookInfo", JSON.stringify(msg.item[0]));
                    location.href="./recommend_result.html";
                    let a = localStorage.getItem("bookInfo");
                    console.log(a);
                })
        }

        $.each(sel_books.children, function (index1, item1) {
            if (item1.children.length > 0) {
                $.each(item1.children, function (index2, item2) {
                    if (item2.children.length > 0) {
                        $.each(item2.children, function (index3, item3) {
                            if (item3.children.length > 0) {
                                $.each(item3.children, function (index4, item4) {
                                    findLarger(item4)
                                })
                                final(item3, 4)
                            }
                        })
                    }
                })
            }
        })

        if (final_value != 0) {
            recommend(final_value);
        } else {
            $.each(sel_books.children, function (index1, item1) {
                if (item1.children.length > 0) {
                    $.each(item1.children, function (index2, item2) {
                        if (item2.children.length > 0) {
                            $.each(item2.children, function (index3, item3) {
                                findLarger(item3)
                            })
                            final(item2, 2)
                        }
                    })
                }
            })

            if (final_value != 0) {
                recommend(final_value);
            } else {
                $.each(sel_books.children, function (index1, item1) {
                    if (item1.children.length > 0) {
                        $.each(item1.children, function (index2, item2) {
                            findLarger(item2)
                        })
                        final(item1, 1)
                    }
                })

                if (final_value != 0) {
                    recommend(final_value);
                }
            }
        }

    })
})
