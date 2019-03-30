(function ($) {
    $(document).ready(function () {
        var difficulty = 0; // 0 = easy, 1 = medium, 2 = hard
        var size = 50;
        var board = [];
        var apple;
        var position = [Math.floor(size / 2), Math.floor(size / 2)]; // x, y
        var snake = [position];
        var length = 1;
        var direction = 3; // 1 = top; 2 = bottom; 3 = right; 4 = left;
        var frameTime = [250, 175, 100];
        var currentTime;
        var xDown = null;                                                        
        var yDown = null;
        var highScore = [0, 0, 0];

        // get high score cookie
        var cookies = document.cookie.split(";");
        cookies.forEach(function (cookie) {
            var keyvalue = cookie.split("=");
            if (keyvalue.length > 1) {
                var key = keyvalue[0].trim();
                var value = keyvalue[1].trim();
                switch (key) {
                    case "highScore":
                        highScore = decodeURIComponent(value).split(",");
                        break;
                    default:
                        break;
                }
            }
        });

        function saveCookie() {
            // expired date for cookie 
			var expireDate = new Date();
			// set for one year
            expireDate.setTime(expireDate.getTime() + (31536000000));
            // set cookie
            document.cookie = "highScore=" + encodeURIComponent(highScore.join()) + ";expires=" + expireDate.toUTCString() + ";";
        }

        // build board array
        for (var y = 0; y < size; y++) {
            var row = []
            for (var x = 0; x < size; x++) {
                row.push("<span class='location' row='" + y + "' column='" + x + "'></span>");
            }
            board.push(row);
            $(".board").append("<div class='board-row row-" + y + "'></div>");
            $(".row-" + y).append(row.join(""));
        }

        // direction functions
        function goUp() {
            if (direction !== 2) {
                direction = 1;
            }
        }
        function goDown() {
            if (direction !== 1) {
                direction = 2;
            }
        }
        function goRight() {
            if (direction !== 4) {
                direction = 3;
            }
        }
        function goLeft() {
            if (direction !== 3) {
                direction = 4;
            }
        }

        // set button functions
        function setButtons() {
            $("Button.top").on("click", goUp);
            $("Button.bottom").on("click", goDown);
            $("Button.right").on("click", goRight);
            $("Button.left").on("click", goLeft);
            $(window).on("keydown", function (e) {
                switch (e.which) {
                    case 38:
                    case 87:
                        goUp();
                        break;
                    case 40:
                    case 83:
                        goDown();
                        break;
                    case 39:
                    case 68:
                        goRight();
                        break;
                    case 37:
                    case 65:
                        goLeft();
                        break;
                    default:
                        break;
                }
            });
        }

        // place apple
        function placeApple() {
            // get open locations
            var openSpots = $(".location").not(".snake");

            // get a random location
            var spot = Math.floor(Math.random() * openSpots.length);
            var location = openSpots[spot];

            // assign apple to new location
            apple = [parseInt($(location).attr("column")), parseInt($(location).attr("row"))];

            $(".apple").removeClass("apple");
            $(".location[row='" + apple[1] + "'][column='" + apple[0] + "']").addClass("apple");
        }

        // draw snake
        function drawSnake() {
            $(".snake").removeClass("snake");
            snake.forEach(function (link) {
                $(".location[row='" + link[1] + "'][column='" + link[0] + "']").addClass("snake");
            })
        }

        // move snake
        function moveSnake() {
            setTimeout(function () {
                // add new direction
                switch (direction) {
                    case 1:
                        position[1] = position[1] - 1;
                        break;
                    case 2:
                        position[1] = position[1] + 1;
                        break;
                    case 3:
                        position[0] = position[0] + 1;
                        break;
                    case 4:
                        position[0] = position[0] - 1;
                        break;
                }

                // check if apple eaten
                if (position[0] === apple[0] && position[1] === apple[1]) {
                    length = length + 1 + difficulty;
                    $(".score-value").text(parseInt($(".score-value").text()) + 10);
                    placeApple();
                    if (currentTime > (frameTime[difficulty] / 4)) {
                        currentTime = currentTime - 10;
                    }
                }

                // if game should be over
                if (position[0] < 0 || position[0] >= size || position[1] < 0 || position[1] >= size || $(".location[row='" + position[1] + "'][column='" + position[0] + "']").hasClass("snake")) {
                    // if high score
                    if (parseInt($(".score-value").text()) > highScore[difficulty]){
                        highScore[difficulty] = parseInt($(".score-value").text());
                    }
                    saveCookie();
                    $(".high-score-value").text(highScore[difficulty]);

                    // reset buttons
                    $(".arrow").off("click");
                    $("window").off("keydown");
                    $(".difficulty").removeClass("disable");
                    $(".start").removeClass("disable");
                    $(".start").on("click", playGame);
                    $(window).on("keydown", function (e) {
                        switch (e.which) {
                            case 32:
                            case 13:
                                playGame();
                                break;
                            default:
                                break;
                        }
                    });
                } else { // else continue play
                    snake.unshift(position.slice(0)); // use slice to clone
                    snake = snake.slice(0, length);
                    drawSnake();
                    moveSnake();
                }
            }, currentTime);
        }

        function playGame() {
            // disable start buttons
            $(".start, .difficulty").addClass("disable");
            $(".start").off("click");
            $(window).off("keydown");
            // reset start 
            direction = 3;
            currentTime = frameTime[difficulty];
            position = [Math.floor(size / 2), Math.floor(size / 2)];
            snake = [position];
            length = 1;
            $(".score-value").text(0);

            // play game
            drawSnake();
            placeApple();
            setButtons();
            moveSnake();
        }

        // difficulty buttons
        $(".easy").on("click", function () {
            difficulty = 0;
            $(".selected").removeClass("selected");
            $(this).addClass("selected");
            $(".high-score-value").text(highScore[difficulty]);
        });
        $(".medium").on("click", function () {
            difficulty = 1;
            $(".selected").removeClass("selected");
            $(this).addClass("selected");
            $(".high-score-value").text(highScore[difficulty]);
        });
        $(".hard").on("click", function () {
            difficulty = 2;
            $(".selected").removeClass("selected");
            $(this).addClass("selected");
            $(".high-score-value").text(highScore[difficulty]);
        });

        // touch swipe events
        function getTouches(evt) {
            return evt.touches ||             // browser API
                evt.originalEvent.touches; // jQuery
        }                                                     

        function handleTouchStart(evt) {
            const firstTouch = getTouches(evt)[0];                                      
            xDown = firstTouch.clientX;                                      
            yDown = firstTouch.clientY;                                      
        };                                                

        function handleTouchMove(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if ( ! xDown || ! yDown ) {
                return;
            }

            var xUp = evt.touches[0].clientX;                                    
            var yUp = evt.touches[0].clientY;

            var xDiff = xDown - xUp;
            var yDiff = yDown - yUp;

            if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
                if ( xDiff > 0 ) {
                    /* left swipe */ 
                    goLeft();
                } else {
                    /* right swipe */
                    goRight();
                }                       
            } else {
                if ( yDiff > 0 ) {
                    /* up swipe */ 
                    goUp();
                } else { 
                    /* down swipe */
                    goDown();
                }                                                                 
            }
            /* reset values */
            xDown = null;
            yDown = null;                                             
        };

        // initial function ties
        $(".high-score-value").text(highScore[difficulty]);
        $(".start").on("click", playGame);
        $(window).on("keydown", function (e) {
            switch (e.which) {
                case 32:
                case 13:
                    playGame();
                    break;
                default:
                    break;
            }
        });

        // get swipes for touch screens
        $(".board").on('touchstart', handleTouchStart);        
        $(".board").on('touchmove', handleTouchMove);
    });
})(jQuery)