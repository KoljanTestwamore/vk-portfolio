const model = new function(){
	this.data = [];
	this.addColumn = function(header){
		let column = {
			header: header,
			cards: [],
		};
		this.data = this.data.concat([column]);
		return column;
	}

	this.addCard = function(column, text, at) {
		const card = text;
		if (at) {
			column.cards = column.cards.slice(0, at + 1).
											concat([card], column.cards.slice(at + 1, column.cards.length));
			return at;				
		} else {
			column.cards = column.cards.concat([card]);
			return column.cards.length;
		}
	}

	this.getColumnLength = function(column) {
		return this.data[this.data.indexOf(column)].length
	}

	this.moveCardFromTo = function(columnAt, cardIndexAt, columnTo, cardIndexTo) {
		const data = this.data;
		const card = columnAt.cards[cardIndexAt];
		columnAt.cards = columnAt.cards.slice(0, cardIndexAt).
					concat(columnAt.cards.slice(cardIndexAt + 1, columnAt.cards.length));
		return this.addCard(columnTo, card, cardIndexTo);
	}		

}();

const view = new function(){
	this.mainContainer = document.querySelector(".main-container");
	this.body = document.querySelector("body");
	this.columns = [];
	this.columnAdder = document.querySelector(".column-adder-container");
	this.columnAdderForm = document.querySelector(".column-adder-form");
	this.columnAdderForm.input = document.querySelector(".column-adder-form .input");
	this.columnAdderForm.cancelImage = document.querySelector(".column-adder-form img");
	this.columnAdderForm.button = document.querySelector(".column-adder-form .green-button");
	this.dragged = document.querySelector(".dragged-card");
	this.tempCard; // Так как временная карточка одновременно может быть одна, закрепим ее так.

	this.columnAdderForm.input.placeholder = "Введите название колонки";

	this.hideColumnInputForm = function() {
		this.columnAdderForm.input.value = "";
		this.columnAdderForm.style.display = "none";
		this.columnAdder.style.display = "flex";
	};

	this.showColumnInputForm = function() {
		this.columnAdder.style.display = "none";
		this.columnAdderForm.style.display = "flex";
	};

	this.hideDragged = function(){
		this.dragged.style.display = "none";
		this.dragged.textContent = "";
	};

	this.showDraggedfromCard = function(card) {
		this.dragged.style.height = this.getHeight(card) + "px"; 
		this.dragged.style.width = this.getWidth(card)  + "px";
		this.dragged.style.display = "block";
		this.dragged.textContent = card.text;
	};

	this.getNewHeader = function() {
		const text = this.columnAdderForm.input.value;
		this.columnAdderForm.input.value = "";
		return text;
	}

	this.getHeight = function(el){
		let style = window.getComputedStyle(el);
		return parseInt(style.getPropertyValue('height'), 10)
	}

	this.getWidth = function(el){
		let style = window.getComputedStyle(el);
		return parseInt(style.getPropertyValue('width'), 10)
	}

	this.setXY = function(el,x,y){
		el.style.left = x + "px";
		el.style.top = y + "px";
	}

	this.setCursor = function(el){
		if (el.matches(".card-adder-container, .card-adder-container *") ||
		el.matches( ".column-adder-container, .column-adder-container *") ||
		el.matches(".green-button") ||
		el.matches(".cancel-image, .cancel-image *"))
			this.body.style.cursor = "pointer";
		else if (el.matches(".card, .card *"))
			this.body.style.cursor = "grab";
		else
			this.setUsualCursor();
	}

	this.setGrabbingCursor = function(){
		this.body.style.cursor = "grabbing";
	}

	this.setUsualCursor = function(){
		this.body.style.cursor = "auto";
	}

	this.createActiveScrollbar = function(ta) {
	if (ta.style.scrollHeight > ta.style.height)
			ta.style.overflowY = "scroll";
		else 
			ta.style.overflowY = "none";
	}

	this.createTempCardFrom = function(column, card) {
		this.tempCard = document.createElement("div");		
		this.tempCard.className = "temp-card";
		this.tempCard.style.height = this.getHeight(card) + "px"; 
		this.tempCard.style.order = card.style.order; 
		this.tempCard.column = column;
		this.tempCard.at = card; // Логичнее назвать так
		this.tempCard.text = card.textContent;
		this.tempCard.wasUp = false;
		column.cardContainer.appendChild(this.tempCard);
		this.setGrabbingCursor();
		card.delete();
	};

	this.moveTempCardTo = function(column, card, isup) {
		column.cardContainer.appendChild(this.tempCard);
		if (isup){
			this.tempCard.style.order = (+card.style.order - 1).toString();
			this.tempCard.wasUp = true;
		} else {
			this.tempCard.style.order = card.style.order;
			this.tempCard.wasUp = false;
		}
		this.tempCard.column = column;
	};

	this.moveTempCardToHeader = function(column) {
		column.cardContainer.appendChild(this.tempCard);
		this.tempCard.style.order = "-1";
		this.tempCard.column = column;
	};

	this.moveTempCardToEnd = function(column) {
		column.cardContainer.appendChild(this.tempCard);
		this.tempCard.style.order = column.cards.length.toString();
		this.tempCard.column = column;
	};

	this.createCardFromTempCard = function() {
		this.tempCard.column.cardContainer.removeChild(this.tempCard);
		const card = this.tempCard.column.addCard(this.tempCard.text, this.tempCard.style.order, this.tempCard.wasUp);
		this.tempCard = null;
		this.setUsualCursor();
		return card;
	};

	this.addColumn = function(text) {
		const column = document.createElement("div");
		column.className = "column";
		this.mainContainer.appendChild(column);

		const header = document.createElement("div");
		header.className = "header";
		header.textContent = text;
		column.appendChild(header);

		const cardContainer = document.createElement("div");
		cardContainer.className = "card-container";
		column.appendChild(cardContainer);

		const cardAdderForm = document.createElement("div");
		cardAdderForm.className = "card-adder-form";
		column.appendChild(cardAdderForm);

		const input = document.createElement("textarea");
		input.className = "input";
		input.placeholder = "Введите название карточки"
		cardAdderForm.appendChild(input);

		const activeElements = document.createElement("div");
		activeElements.className = "active-elements";
		cardAdderForm.appendChild(activeElements);

		const button = document.createElement("button");
		button.className = "green-button";
		button.textContent = "Добавить карточку";
		activeElements.appendChild(button);

		const cancelImage = document.createElement("img");
		cancelImage.className = "cancel-image";
		cancelImage.src = "static/images/cross.svg";
		activeElements.appendChild(cancelImage);
		
		const cardAdderContainer = document.createElement("div");
		cardAdderContainer.className = "card-adder-container";
		column.appendChild(cardAdderContainer);

		const plusImage = document.createElement("img");
		plusImage.className = "plus-image";
		plusImage.src = "static/images/plus.svg";
		cardAdderContainer.appendChild(plusImage);

		const cardAdder = document.createElement("div");
		cardAdder.className = "card-adder";
		cardAdder.textContent = "Добавить еще одну карточку";
		cardAdderContainer.appendChild(cardAdder);

		column.header = header;
		column.cardAdder = cardAdderContainer;
		column.cardContainer = cardContainer;
		column.cardAdderForm = cardAdderForm;
		column.cancelImage = cancelImage;
		column.cards = [];
		column.input = input;
		column.cancel = cancelImage;
		column.button = button;
		column.tempCard;

		this.hideColumnInputForm();

		const index = this.columns.length;

		this.columns = this.columns.concat([column]);

		column.addCard = function(text, ord, wasUp) {
			const card = document.createElement("span");
			card.className = "card";
			card.textContent = text;
			let order;
			if (ord) {
				order = +ord;
				if (wasUp)
					order += 1;   // нужно сделать, потому что order в flexbox и позиция в сплайсе работают по разному
			} else 
				order = column.cards.length;
			if (order > 0)
				column.cards.splice(order, 0, card);
			else 
				column.cards.splice(0, 0, card);

			card.style.order = order.toString();
			column.cardContainer.appendChild(card);
			card.text = text;
			cardContainer.scrollTop = cardContainer.scrollHeight;
			card.delete = function() {
				column.cards.splice(column.cards.indexOf(card), 1)
				column.cardContainer.removeChild(card);
				return card;
			};

			card.setOrder = function(ord) {
				card.style.order = ord.toString();
			}

			card.getOrder = function() {
				return +card.style.order;
			}

			card.getColumn = function() {
				return column;
			}

			card.getText = function() {
				return text;
			}

			column.reiterateCards();
			return card;
		}

		column.getInput = function() {
			return column.input.value;
		}

		column.hideCardInputForm = function() {
			input.value = "";
			cardAdderForm.style.display = "none";
			cardAdderContainer.style.display = "flex";		
		}

		column.showCardInputForm = function() {
			cardAdderForm.style.display = "flex";
			cardAdderContainer.style.display = "none";
		}

		column.reiterateCards = function() {
			for (let i in column.cards) {
				column.cards[i].setOrder(i);
			}
		}

		column.getIndex = function() {
			return index;
		}

		column.getCardsAmount = function() {
			return column.cards.length;
		}

		return column;
	}
}();

const controller = new function(model,view) {
	let cardIndexLinker = new WeakMap();
	let columnLinker = new WeakMap();
	let draggedCard; // Нужно, чтобы перекидывать карточки
	let indexDraggedTo;
	let dragging = false;
	let mouseMovedUp = true;
	let mousePreviousY = 0;
	let draggedX, draggedY;

	this.controllerAddCard = function (column) {
		const card = column.addCard(column.getInput());
		cardIndexLinker.set(card,model.addCard(columnLinker.get(column), column.getInput()));
		column.hideCardInputForm();
	};

	this.controllerAddColumn = function() {
		const header = view.getNewHeader();
		const column = view.addColumn(header);
		let cardIndex = 0;

		columnLinker.set(column, model.addColumn(header));

		column.cardAdder.addEventListener("click", ()=>{
			for (let c of view.columns)
				c.hideCardInputForm();
			view.createActiveScrollbar(column.input);
			column.showCardInputForm();
		});

		column.addEventListener("mouseover", (e) => {
			if (dragging) {
				if (e.target === column.header) {	// Кинуть карточку в начало колонки
					view.moveTempCardToHeader(column);
					indexDraggedTo = 0;
				} else if ((e.target === column.input) || (e.target === column.cardAdder)) { // кинуть карточку в низ колонки
					view.moveTempCardToEnd(column);
					indexDraggedTo = model.getColumnLength(columnLinker.get(column));
				} else if (column.cards.includes(e.target)) { 
					const card = e.target;
					view.moveTempCardTo(column,card,mouseMovedUp);
					indexDraggedTo = cardIndexLinker.get(card);
				}
			}
		});

		column.addEventListener("mousedown", (e) => {
			if (column.cards.includes(e.target)) {
				e.preventDefault();
				const card = e.target;

				draggedCard = card;
				indexDraggedTo = cardIndexLinker.get(card);

				draggedX = card.offsetLeft - e.pageX;
				draggedY = card.offsetTop - column.cardContainer.scrollTop - e.pageY;
				dragging = true;

				view.setXY(view.dragged, e.pageX + draggedX, e.pageY + draggedY)

				view.showDraggedfromCard(card);
				view.createTempCardFrom(column, card);
			}
		});

		column.input.addEventListener("input", ()=>{
			view.createActiveScrollbar(column.input);
		})

		column.input.addEventListener("keypress", (e)=>{
			if ((e.keyCode === 13) && !(e.shiftKey)) {
				this.controllerAddCard(column, columnLinker, cardIndexLinker);
			}
		})
		
		column.button.addEventListener("click",()=>{
			this.controllerAddCard(column, columnLinker, cardIndexLinker);
		})

		column.cancelImage.addEventListener("click", () => {
			column.hideCardInputForm();
		})
	};

	document.addEventListener("mousemove",(e) => {
		if (dragging) {
			if (e.pageY - mousePreviousY > 0)
				mouseMovedUp = false;
			else if (e.pageY - mousePreviousY < 0)
				mouseMovedUp = true;
			mousePreviousY = e.pageY;

			view.setXY(view.dragged, e.pageX + draggedX, e.pageY + draggedY)
		}
	});

	document.addEventListener("mouseup",() => {
		if (dragging) {
			dragging = false;
			view.hideDragged();
			const card = view.createCardFromTempCard();
			const column = card.getColumn();
			cardIndexLinker.set(card, model.moveCardFromTo(columnLinker.get(draggedCard.getColumn()), 
				cardIndexLinker.get(draggedCard), 
				columnLinker.get(column), 
				indexDraggedTo)
			);
		}
	});

	view.body.addEventListener("mouseover", (e)=>{
		if (!dragging)
			view.setCursor(e.target);
	})

	view.columnAdder.addEventListener("click", ()=>{
		view.createActiveScrollbar(view.columnAdderForm.input);
		view.showColumnInputForm();
	});

	view.columnAdderForm.input.addEventListener("input", ()=>{
		view.createActiveScrollbar(view.columnAdderForm.input);
	})

	view.columnAdderForm.input.addEventListener("keypress", (e)=>{
		if ((e.keyCode === 13) && !(e.shiftKey))
			this.controllerAddColumn();
	})

	view.columnAdderForm.cancelImage.addEventListener("click", ()=> {
		view.hideColumnInputForm();
	});

	view.columnAdderForm.button.addEventListener("click", ()=> {
		this.controllerAddColumn();
	});


}(model,view);
